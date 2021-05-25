import { v4 as uuidv4 } from "uuid";
import { REMOVE_ALERT, SET_ALERT } from "../constants/alertConstants";
export const setAlert = (msg, alert_type) => (dispatch) => {
  const id = uuidv4();
  dispatch({ type: SET_ALERT, payload: { id, msg, alert_type } });
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), 5000);
};
