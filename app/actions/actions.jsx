import firebaseRef, {getUserRef} from 'firebaseRef';
import {hashHistory} from 'react-router'
import moment from 'moment';

export var signupChange = (updates) => {
  return {
    type: 'CHANGE_SIGNUP',
    updates
  };
};

export var setSearchText = (searchText) => {
  return {
    type: 'SET_SEARCH_TEXT',
    searchText
  };
};

export var toggleShowCompleted = () => {
  return {
    type: 'TOGGLE_SHOW_COMPLETED'
  };
};

export var addTodo = (todo) => {
  return {
    type: 'ADD_TODO',
    todo
  };
};

export var updateTodo = (id, updates) => {
  return {
    type: 'UPDATE_TODO',
    id,
    updates
  };
};

export var createTodo = (text) => {
  return (dispatch, getState) => {
    var uid = getState().login.uid;
    var todosRef = getUserRef(uid).child('todos');
    var todo = {
      text,
      completed: false,
      createdAt: moment().unix(),
      completedAt: null
    };

    var todoRef = todosRef.push(todo, (err) => {
      dispatch(addTodo({
        ...todo,
        id: todoRef.key()
      }));
    });
  }
};

export var populateTodos = (todos) => {
  return (dispatch, getState) => {
    var uid = getState().login.uid;
    var todosRef = getUserRef(uid).child('todos');

    todosRef.once('value', (snapshot) => {
      var val = snapshot.val();
      var todos = Object.keys(val).map((key) => {
        dispatch(addTodo({
          ...val[key],
          id: key
        }));
      });
    });
  }
};

export var toggleTodo = (id) => {
  return (dispatch, getState) => {
    var uid = getState().login.uid;
    var todoRef = getUserRef(uid).child(`todos/${id}`);
    var updates;

    todoRef.once('value').then((snapshot) => {
      var newCompleted = !snapshot.val().completed;
      updates = {
        completed: newCompleted,
        completedAt: newCompleted ? moment().unix() : null
      };

      return todoRef.update(updates)
    }).then(() => {
      dispatch(updateTodo(id, updates));
    });
  };
};

export var createUser = (email = '', password = '') => {
  return (dispatch, getState) => {
    return firebaseRef.createUser({
      email,
      password
    }).then(() => {
      dispatch(showFlashMessage('Account created!', 'success'));
      hashHistory.push('/login');
      return;
    }, (e) => {
      dispatch(showFlashMessage(e.message, 'error'));
      throw new Error(e.message);
    });
  };
};

export var login = (token, uid) => {
  return {
    type: 'LOGIN',
    token,
    uid
  };
};

export var logout = () => {
  return {
    type: 'LOGOUT'
  };
};

export var startLogin = (email = '', password = '') => {
  return (dispatch, getState) => {
    return firebaseRef.authWithPassword({
      email,
      password
    }).then((authData) => {
      debugger;
      dispatch(login(authData.token, authData.uid));
      dispatch(populateTodos());
      return authData.password.isTemporaryPassword;
    }, (error) => {
      debugger;
      throw new Error(error.message);
    });
  }
};

export var startLogout = () => {
  return (dispatch, getState) => {
    return firebaseRef.unauth().then(function () {
      dispatch(logout());
      return;
    }, (error) => {
      throw new Error(error.message);
    });
  }
};

export var requestReset = (email = '') => {
  return (dispatch, getState) => {
    return firebaseRef.resetPassword({email});
  }
};

export var changePassword = (opts = {}) => {
  return (dispatch, getState) => {
    return firebaseRef.changePassword(opts);
  }
};

export var showFlashMessage = (message, messageType = 'alert') => {
  return {
    type: 'SHOW_FLASH_MESSAGE',
    message,
    messageType
  }
};

export var clearFlashMessage = () => {
  return {
    type: 'CLEAR_FLASH_MESSAGE'
  }
};
