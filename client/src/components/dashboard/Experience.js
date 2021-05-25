import React from "react";
import Moment from "react-moment";
import PropTypes from "prop-types";
import { Fragment } from "react";
import { connect } from "react-redux";
import { deleteExperience } from "../../actions/profileActions";

const Experience = ({ experience, deleteExperience }) => {
  return (
    <Fragment>
      <h2 className="my-2"> Experience Credentials</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Company</th>
            <th className="hide-sm"> Title </th>
            <th className="hide-sm"> Year </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {experience.map((x) => (
            <tr key={x._id}>
              <td> {x.company}</td>
              <td className="hide-sm"> {x.title}</td>
              <td>
                {" "}
                <Moment format="YYYY/MM/DD">{x.from}</Moment> -{" "}
                {x.to === null ? (
                  " Now"
                ) : (
                  <Moment format="YYYY/MM/DD">{x.to}</Moment>
                )}
              </td>
              <td>
                <button
                  onClick={() => deleteExperience(x._id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>{" "}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Fragment>
  );
};

Experience.propTypes = {
  experience: PropTypes.array.isRequired,
  deleteExperience: PropTypes.func.isRequired,
};

export default connect(null, { deleteExperience })(Experience);
