import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { getPost } from "../../actions/postActions";
import { connect } from "react-redux";
import Spinner from "../layout/Spinner";
import { Fragment } from "react";
import PostItem from "../posts/PostItem";
import { Link } from "react-router-dom";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

const Post = ({ getPost, post: { post, loading }, location }) => {
  const postId = location.pathname.split("/")[2];
  useEffect(() => {
    getPost(postId);
  }, [getPost, postId]);

  return loading || post === null ? (
    <Spinner></Spinner>
  ) : (
    <Fragment>
      <Link to="/posts" className="btn">
        Back to Posts
      </Link>
      <PostItem post={post} showActions={false}></PostItem>
      <CommentForm postId={post._id}></CommentForm>
      <div className="comments">
        {post.comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            postId={post._id}
          ></CommentItem>
        ))}
      </div>
    </Fragment>
  );
};

Post.propTypes = {
  post: PropTypes.object.isRequired,
  getPost: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  post: state.post,
});
export default connect(mapStateToProps, { getPost })(Post);
