/* abstract */ class SessionStore {
  findSession(id) {}
  saveSession(id, session) {}
  findAllSessions() {}
}

class InMemorySessionStore extends SessionStore {
  constructor() {
    super();
    this.sessions = new Map();
  }

  findSession(id) {
    return this.sessions.get(id);
  }
  
  saveSession(id, session) {
    this.sessions.set(id, session);
    // console.log('this.sessions store', this.sessions)
  }
  
  findAllSessions() {
    // console.log('this.sessions.values()' , this.sessions);
    return [...this.sessions.values()];
  }
}

module.exports = {
  InMemorySessionStore
};
