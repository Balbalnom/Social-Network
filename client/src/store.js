import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import rootRuducer from "./reducers";

const initialState = {};

const middleware = [thunk];

const store = createStore(
  rootRuducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
