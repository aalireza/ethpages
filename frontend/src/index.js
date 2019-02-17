var savedHash = location.hash; // uport clobbers the hash, need to save it for later
var emailValidator = require('email-validator');
var Connect = require('uport-connect').Connect;
var uport = new Connect('ethpages');
var fm = new Fortmatic('pk_test_373C8980D07911F3');
var web3 = new Web3(fm.getProvider());

var contractAddress = null; 
var minRequiredVerifications = 1;

var contract = null;

var search = async function(text) {
    var addrs = await contract.methods.getUsers().call({}); // fetch users
    var futs = [];
    for(var i = 0; i !== addrs.length; ++i) {
        var addr = addrs[i];
        futs.push(contract.methods.getUser(addr).call({}));
    }
    var users = await Promise.all(futs);
    for(var i = 0; i !== addrs.length; ++i) {
        users[i].address = addrs[i];
    }

    users.forEach(function(user) {
        var verified = true;
        if(user.telegram && user.numTelegramVerifications < minRequiredVerifications) {
            verified = false;
        }
        if(user.email && user.numEmailVerifications < minRequiredVerifications) {
            verified = false;
        }
        user.verified = verified;
    });
    var results = [];
    var text = text.toLowerCase();
    for(var i = 0; i !== users.length; ++i) {
        var user = users[i];
        if(JSON.stringify(user).toLowerCase().indexOf(text) !== -1) {
            results.push(user);
        }
    }
    return results;
};

/**
 * user:
 *  name: String
 *  telegram: String | null
 *  email: String | null
 */
var submit = async function(user) {
    var accountAddress = (await web3.eth.getAccounts())[0];

    var name = user.name;
    var email = user.email !== null ? user.email : '';
    var telegram = user.telegram !== null ? user.telegram : '';
    await contract.methods.makeUser(email, name, telegram).send({
        from: accountAddress
    });

    return true;
};

var haveProfile = async function() {
    var accountAddress = (await web3.eth.getAccounts())[0];
    var addrs = await contract.methods.getUsers().call({}); 
    return addrs.indexOf(accountAddress) !== -1;
};

var getVerificationStatus = async function() {
    var accountAddress = (await web3.eth.getAccounts())[0];
    var user = await contract.methods.getUser(accountAddress).call({});
    var result = {};
    if(user.telegram) {
        result.telegram = user.numTelegramVerifications >= minRequiredVerifications;
    }
    if(user.email) {
        result.email = user.numEmailVerifications >= minRequiredVerifications;
    }
    return result;
};

var resendVerifications = async function() {
    var accountAddress = (await web3.eth.getAccounts())[0];
    var status = await getVerificationStatus();
    var proms = [];
    if(status.email === false) {
        await contract.methods.requestEmailVerification().send({
            from: accountAddress
        });
    }
    if(status.telegram === false) {
        await contract.methods.requestTelegramVerification().send({
            from: accountAddress
        });
    }
};

var importFromUport = async function(attrs) {
    uport.requestDisclosure({
        verified: attrs
    });
    var res = await uport.onResponse('disclosureReq');
    return res;
};

var state = {
    failed: ko.observable(false),
    activePageId: ko.observable(null),
    search: {
        searchText: ko.observable(''),
        doSearch: function() {
            var searchText = state.search.searchText().trim();
            state.activePageId('searchResults');
            state.searchResults.enter(searchText);
        },
        tryRestoreFromHash: function(hash) {
            if(hash === '#!/search') {
                this.enter();
                return true;
            }
            return false;
        },
        enter: function() {
            location.hash = '#!/search'; 
            this.searchText('');
        }
    },
    searchResults: {
        searchText: ko.observable(''),
        results: ko.observable(null),
        tryRestoreFromHash: function(hash) {
            var prefix = '#!/results/';
            if(hash.indexOf(prefix) === 0) {
                var searchText = hash.substring(prefix.length);
                this.enter(searchText);
                return true;
            }
            return false;
        },
        enter: function(searchText) {
            state.searchResults.searchText(searchText);
            location.hash = '#!/results/' + encodeURIComponent(this.searchText());
            state.searchResults.results(null);
            search(state.searchResults.searchText()).then(function(results) {
                state.searchResults.results(results);
            }).catch(function(ex) {
                console.error(ex);
                state.failed(true);
            });
        },
        doSearch: function() {
            state.activePageId('searchResults');
            state.searchResults.enter(state.searchResults.searchText());
        }
    },
    addOrEdit: {
        editing: ko.observable(false),
        name: ko.observable(''),
        telegram: ko.observable(null),
        twitter: ko.observable(null),
        reddit: ko.observable(null),
        email: ko.observable(null),
        maxVerifiableCount: 4,
        importing: ko.observable(false),
        submitting: ko.observable(false),
        tryRestoreFromHash: function(hash) {
            if(hash.indexOf('#!/add') === 0) {
                this.enter(false);
                return true;
            } else if(hash.indexOf('#!/edit') === 0) {
                this.enter(true);
                return true;
            }
            return false;
        },
        enter: function(editing) {
            state.addOrEdit.editing(editing);
            state.addOrEdit.importing(false);
            state.addOrEdit.name('');
            state.addOrEdit.telegram(null);
            state.addOrEdit.twitter(null);
            state.addOrEdit.reddit(null);
            state.addOrEdit.email(null);
            if(state.addOrEdit.editing()) {
                location.hash = '#!/edit';
            } else {
                location.hash = '#!/add';
            }
            $('[data-toggle="tooltip"').tooltip();
        },
        submit: function() {
            state.addOrEdit.submitting(true);
            submit({
                name: state.addOrEdit.name(),
                telegram: state.addOrEdit.telegram(),
                twitter: state.addOrEdit.twitter(),
                reddit: state.addOrEdit.reddit(),
                email: state.addOrEdit.email()
            }).then(function() {
                state.addOrEdit.submitting(false);
                state.activePageId('submissionStatus');
                state.submissionStatus.enter();
            }).catch(function(ex) {
                console.error(ex);
            });
        },
        verifiableInfo: ko.pureComputed(function() {
            var parts = [];
            if(state.addOrEdit.telegram() !== null) {
                parts.push('Telegram');
            }
            if(state.addOrEdit.twitter() !== null) {
                parts.push('Twitter');
            }
            if(state.addOrEdit.reddit() !== null) {
                parts.push('Reddit');
            }
            if(state.addOrEdit.email() !== null) {
                parts.push('email');
            }
            return parts;
        }),
        nextError: ko.pureComputed(function() {
            var name = state.addOrEdit.name().trim();
            if(name.length === 0) {
                return 'Specify your name or alias.';
            }

            if(state.addOrEdit.verifiableInfo().length === 0) {
                return 'Add at least one piece of verifiable information below.';
            }

            var telegram = state.addOrEdit.telegram();
            if(telegram !== null && telegram.length === 0) {
                return 'Fill in your Telegram username.';
            }

            var twitter = state.addOrEdit.twitter();
            if(twitter !== null && twitter.length === 0) {
                return 'Fill in your Twitter username.';
            }

            var reddit = state.addOrEdit.reddit();
            if(reddit !== null && reddit.length === 0) {
                return 'Fill in your Reddit username.';
            }

            var email = state.addOrEdit.email();
            if(email !== null && email.length === 0) {
                return 'Fill in your email.';
            }
            if(email !== null && !emailValidator.validate(email)) {
                return 'Fill in your email (the current email is invalid).';
            }

            return null;
        }),
        doImportFromUport: function() {
            state.addOrEdit.importing(true);
            importFromUport(['name', 'email']).then(function(res) {
                state.addOrEdit.importing(false);
                state.addOrEdit.name(res.payload.name);
                state.addOrEdit.email(res.payload.email);
            }).catch(function(ex) {
                console.warn(ex);
                state.addOrEdit.importing(false);
            });
        },
        addTelegram: function() {
            this.addOrEdit.telegram('');
        },
        removeTelegram: function() {
            this.addOrEdit.telegram(null);
        },
        addTwitter: function() {
            this.addOrEdit.twitter('');
        },
        removeTwitter: function() {
            this.addOrEdit.twitter(null);
        },
        addReddit: function() {
            this.addOrEdit.reddit('');
        },
        removeReddit: function() {
            this.addOrEdit.reddit(null);
        },
        addEmail: function() {
            this.addOrEdit.email('');
        },
        removeEmail: function() {
            this.addOrEdit.email(null);
        },
        cancel: function() {
            state.activePageId('search');
            state.search.enter();
        }
    },
    submissionStatus: {
        verificationStatus: ko.observable(null),
        tryRestoreFromHash: function(hash) {
            if(hash === '#!/submissionStatus') {
                this.enter();
                return true;
            }
            return false;
        },
        enter: function() {
            var that = this;
            location.hash = '#!/submissionStatus';
            getVerificationStatus().then(function(verificationStatus) {
                state.submissionStatus.verificationStatus(verificationStatus);
            }).catch(function(ex) {
                console.error(ex);
            });
        },
        resendVerifications: function() {
            resendVerifications().catch(console.error.bind(console));
        },
        backToSearch: function() {
            state.activePageId('search');
            state.search.enter();
        }
    }
};

var pageIds = ['search', 'searchResults', 'addOrEdit', 'submissionStatus'];

state.addYourself = function() {
    var fn = async function() {
        var entered = false;
        if(await haveProfile()) {
            var numUnverified = Object.keys(await getVerificationStatus()).length;
            if(numUnverified > 0) {
                state.activePageId('submissionStatus');
                state.submissionStatus.enter();
                entered = true;
            } else {
                alert('Editing accounts is not supported yet');
                // TODO
                // state.activePageId('addOrEdit');
                // state.addOrEdit.enter(true);
            }
        } else {
            state.activePageId('addOrEdit');
            state.addOrEdit.enter(false);
        }
    };
    fn().catch(console.error.bind(console));
};

var restorePage = function() {
    var hash = location.hash;
    var done = false;
    if(hash === '') {
        state.activePageId('search');
        state.search.enter();
        done = true;
    } else for(var i = 0; i !== pageIds.length; ++i) {
        var page = state[pageIds[i]];
        if(page.tryRestoreFromHash(hash)) {
            state.activePageId(pageIds[i]);
            done = true;
            break;
        }
    }
    if(!done) {
        location.hash = '';
        state.activePageId('search');
        state.search.enter();
        done = true;
    }
};

var run = async function() {
    location.hash = savedHash;
    var info = await (await fetch('Keybook.json')).json();
    var abi = JSON.parse(info.contracts['Keybook.sol:Keybook'].abi);
    contractAddress = (await (await fetch('config.json')).json()).contractAddress;
    contract = new web3.eth.Contract(abi, contractAddress);
    restorePage();
    onhashchange = function() {
        restorePage();
    };
};

onload = function() {
    run().catch(console.error.bind(console));
    ko.applyBindings(state);
};
