var savedHash = location.hash; // uport clobbers the hash, need to save it for later
var emailValidator = require('email-validator');
var Connect = require('uport-connect').Connect;
var uport = new Connect('ethpages');

// TODO remove central dependencies in index.html once this is running on node-webkit

var mockUsers = {
    '0x12345': {
        name: 'John Brown',
        telegram: null,
        email: 'john.brown@gmail.com'
    },
    '0x23456': {
        name: 'Test Guy',
        telegram: 'testguy',
        email: null
    }
};

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var search = async function(text) {
    await timeout(500);
    var results = [];
    var keys = Object.keys(mockUsers);
    text = text.toLowerCase();
    for(var i = 0; i !== keys.length; ++i) {
        var user = mockUsers[keys[i]];
        if(JSON.stringify(user).toLowerCase().indexOf(text) !== -1) {
            var obj = JSON.parse(JSON.stringify(user));
            obj.address = keys[i];
            results.push(obj);
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
    await timeout(500);
    var addr = '0x';
    for(var i = 0; i !== 20; ++i) {
        addr += Math.floor(Math.random()*10);
    }
    mockUsers[addr] = user;
    return true;
};

var getVerificationStatus = async function() {
    await timeout(500);
    return {
        'telegram': false,
        'email': false
    };
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
        }
    }
};

var pageIds = ['search', 'searchResults', 'addOrEdit', 'submissionStatus'];

state.addYourself = function() {
    state.activePageId('addOrEdit');
    state.addOrEdit.enter(false);
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
    restorePage();
};

onload = function() {
    run().catch(console.error.bind(console));
    ko.applyBindings(state);
    onhashchange = function() {
        restorePage();
    };
};
