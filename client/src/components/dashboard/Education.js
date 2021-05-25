import React from "react";
import Moment from "react-moment";
import PropTypes from "prop-types";
import { Fragment } from "react";
import { connect } from "react-redux";
import { deleteEducation } from "../../actions/profileActions";

const Education = ({ education, deleteEducation }) => {
  return (
    <Fragment>
      <h2 className="my-2"> Education Credentials</h2>
      <table className="table">
        <thead>
          <tr>
            <th>School</th>
            <th className="hide-sm"> Degree</th>
            <th className="hide-sm"> Year </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {education.map((x) => (
            <tr key={x._id}>
              <td> {x.school}</td>
              <td className="hide-sm"> {x.degree}</td>
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
                  onClick={() =>
                    window.confirm("Are you sure want to delete education")
                      ? deleteEducation(x._id)
                      : ""
                  }
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

Education.propTypes = {
  education: PropTypes.array.isRequired,
  deleteEducation: PropTypes.func.isRequired,
};

export default connect(null, { deleteEducation })(Education);
