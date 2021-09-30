import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import likeImg from "../images/768px-OOjs_UI_icon_heart.png";

function Post() {
  let { id } = useParams();
  id = atob(id);
  let history = useHistory();
  const [postObject, setPostObject] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [like, setLike] = useState({
    liked: [],
    likes: [],
  });
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    axios
      .get(`https://shitdoug.herokuapp.com/posts/byid/${id}`)
      .then((response) => {
        setPostObject(response.data);
      });
    axios
      .get(`https://shitdoug.herokuapp.com/comments/${id}`)
      .then((response) => {
        setComments(response.data);
      });
    axios
      .get(`https://shitdoug.herokuapp.com/likes/bypostid/${id}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((response) => {
        setLike({ liked: response.data.liked, likes: response.data.likes });
      });
  }, [id]);

  const [deleteCommentWarning, setDeleteCommentWarning] = useState({});
  const [deletePostWarning, setDeletePostWarning] = useState({});

  useEffect(() => {
    setDeleteCommentWarning({ id: 0, opacity: 0, visibility: "hidden" });
    setDeletePostWarning({ id: 0, opacity: 0, visibility: "hidden" });
  }, []);

  const likePost = (id) => {
    axios
      .post(
        "https://shitdoug.herokuapp.com/likes",
        { PostId: id },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then((response) => {
        const likearray = like.likes;
        if (response.data.liked) {
          likearray.push(0);
        } else likearray.pop();
        setLike({
          liked: response.data.liked,
          likes: likearray,
        });
      });
  };

  const addComment = () => {
    axios
      .post(
        "https://shitdoug.herokuapp.com/comments",
        {
          commentText: newComment,
          PostId: id,
        },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      )
      .then((response) => {
        if (response.data.error) {
          console.log(response.data.error);
        } else {
          const commentToAdd = {
            commentText: response.data.commentText,
            username: response.data.username,
            id: response.data.id,
          };
          setComments([...comments, commentToAdd]);
          setNewComment("");
        }
      });
  };

  const deleteComment = (id) => {
    axios
      .delete(`https://shitdoug.herokuapp.com/comments/${id}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then(() => {
        setComments(
          comments.filter((val) => {
            return val.id !== id;
          })
        );
      });
  };

  const deletePost = (id) => {
    axios
      .delete(`https://shitdoug.herokuapp.com/posts/${id}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then(() => {
        history.push("/");
      });
  };

  const editPost = (field) => {
    if (field === "title") {
      let newTitle = prompt("New Title:", postObject.title);
      if (newTitle === null) {
        return;
      } else {
        axios.put(
          "https://shitdoug.herokuapp.com/posts/title",
          {
            newTitle: newTitle,
            id: id,
          },
          {
            headers: { accessToken: localStorage.getItem("accessToken") },
          }
        );
      }
      setPostObject({ ...postObject, title: newTitle });
    } else if (field === "postText") {
      let newPostText = prompt("New Text:", postObject.postText);
      if (newPostText === null) {
        return;
      } else {
        axios.put(
          "https://shitdoug.herokuapp.com/posts/postText",
          {
            newPostText: newPostText,
            id: id,
          },
          {
            headers: { accessToken: localStorage.getItem("accessToken") },
          }
        );
        setPostObject({ ...postObject, postText: newPostText });
      }
    }
  };

  return (
    <div className="postPage">
      {Object.keys(postObject).length === 0 || Array.isArray(like.liked) ? (
        <div></div>
      ) : (
        <>
          <div className="leftSide">
            <div className="title">
              <span className="titletext">
                <b>{postObject.title}</b>
                {authState.username === postObject.username && (
                  <span
                    className="edit"
                    onClick={() => {
                      editPost("title");
                    }}
                  >
                    &nbsp;&nbsp;*
                    <span className="edithint">&nbsp;&nbsp;click to edit</span>
                  </span>
                )}
              </span>
            </div>
            <div className="postText">
              <span className="postTexttext">
                {postObject.postText}
                {authState.username === postObject.username && (
                  <span
                    className="edit"
                    onClick={() => {
                      editPost("postText");
                    }}
                  >
                    &nbsp;&nbsp;*
                    <span className="edithint">&nbsp;&nbsp;click to edit</span>
                  </span>
                )}
              </span>
            </div>
            <div className="footer" style={{ marginTop: "20px" }}>
              <Link
                to={`/profile/${btoa(postObject.UserId)}`}
                className="username"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                {`— ${postObject.username}`}
              </Link>
              <div className="icon">
                <img
                  className={like.liked ? "unlikebtn" : "likebtn"}
                  src={likeImg}
                  alt="Like"
                  onClick={() => {
                    likePost(id);
                  }}
                />
                <label>&nbsp;{like.likes.length}</label>
              </div>
              <div className="line"></div>
            </div>
            {authState.username === postObject.username && (
              <button
                onClick={() => {
                  setDeletePostWarning({
                    id: postObject.id,
                    opacity: 1,
                    visibility: "visible",
                  });
                }}
                className="deletePost"
              >
                Delete Post
              </button>
            )}
          </div>
          <div className="rightSide">
            <div className="addCommentContainer">
              <input
                type="text"
                placeholder="Comment.."
                autoComplete="off"
                value={newComment}
                onChange={(event) => {
                  setNewComment(event.target.value);
                }}
              />
              <button onClick={addComment}>Add Comment</button>
            </div>
            <div className="listOfComments">
              {comments.map((comment, key) => {
                return (
                  <div key={key} className="comment">
                    {comment.commentText}
                    <label> &nbsp;—{comment.username} </label>
                    {authState.username === comment.username && (
                      <button
                        onClick={() => {
                          setDeleteCommentWarning({
                            id: comment.id,
                            opacity: 1,
                            visibility: "visible",
                          });
                        }}
                        className="deleteComment"
                      >
                        x
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className="warning deleteCommentWarning"
            style={{
              opacity: deleteCommentWarning.opacity,
              visibility: deleteCommentWarning.visibility,
            }}
          >
            <div style={{ gridArea: "text", margin: "10px auto" }}>
              Are you sure you want to delete this comment?
            </div>
            <button
              style={{ gridArea: "button1" }}
              onClick={() => {
                deleteComment(deleteCommentWarning.id);
                setDeleteCommentWarning({
                  id: 0,
                  opacity: 0,
                  visibility: "hidden",
                });
              }}
            >
              Yes
            </button>
            <button
              style={{ gridArea: "button2" }}
              onClick={() => {
                setDeleteCommentWarning({
                  id: 0,
                  opacity: 0,
                  visibility: "hidden",
                });
              }}
            >
              No
            </button>
          </div>
          <div
            className="warning deletePostWarning"
            style={{
              opacity: deletePostWarning.opacity,
              visibility: deletePostWarning.visibility,
            }}
          >
            <div style={{ gridArea: "text", margin: "10px auto" }}>
              Are you sure you want to delete this post?
            </div>
            <button
              style={{ gridArea: "button1" }}
              onClick={() => {
                deletePost(deletePostWarning.id);
                setDeletePostWarning({
                  id: 0,
                  opacity: 0,
                  visibility: "hidden",
                });
              }}
            >
              Yes
            </button>
            <button
              style={{ gridArea: "button2" }}
              onClick={() => {
                setDeletePostWarning({
                  id: 0,
                  opacity: 0,
                  visibility: "hidden",
                });
              }}
            >
              No
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Post;
