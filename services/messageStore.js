/* abstract */ class MessageStore {
    saveMessage(msg) {}
    findMessagesForUser(userID) {}
  }
  
  class InMemoryMessageStore extends MessageStore {
    constructor() {
      super();
      this.msgs = [];
    }
  
    saveMessage(msg) {
      console.log('saved msg', msg);
      this.msgs.push(msg);
    }
    
    findMessagesForUser(userFullname) {
      // console.log('store msgs', this.msgs)
      const filteredMsg = this.msgs.filter(
        ({ from, to }) => from === userFullname || to === userFullname
        );
        return filteredMsg
    }
  }
  
  module.exports = {
    InMemoryMessageStore,
  };
  