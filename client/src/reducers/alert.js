import { REMOVE_ALERT, SET_ALERT } from "../constants/alertConstants";
export const alertReducer = (state = [], action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_ALERT:
      return [...state, payload];
    case REMOVE_ALERT:
      return state.filter((i) => i.id !== payload);
    default:
      return state;
  }
};
