import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import likeImg from "../images/768px-OOjs_UI_icon_heart.png";

function Profile() {
  let { id } = useParams();
  id = atob(id);
  let history = useHistory();
  const [username, setUsername] = useState("");
  const [listOfPosts, setListOfPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    axios
      .get(`https://shitdoug.herokuapp.com/auth/userinfo/${id}`)
      .then((response) => {
        setUsername(response.data.username);
      });
    axios
      .get(`https://shitdoug.herokuapp.com/posts/byuserid/${id}`)
      .then((response) => {
        setListOfPosts(response.data);
        console.log(authState.id);
        setLikedPosts(
          response.data
            .map((post) => post.Likes)
            .flat()
            .filter((like) => authState.id === like.UserId)
            .map((like) => like.PostId)
        );
      });
  }, [id, authState]);

  const likePost = (postId) => {
    axios
      .post(
        "https://shitdoug.herokuapp.com/likes",
        { PostId: postId },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then((response) => {
        setListOfPosts(
          listOfPosts.map((post) => {
            if (post.id === postId) {
              if (response.data.liked) {
                return { ...post, Likes: [...post.Likes, 0] };
              } else {
                const likearray = post.Likes;
                likearray.pop();
                return { ...post, Likes: likearray };
              }
            } else return post;
          })
        );
        if (likedPosts.includes(postId)) {
          setLikedPosts(
            likedPosts.filter((id) => {
              return id !== postId;
            })
          );
        } else setLikedPosts([...likedPosts, postId]);
      });
  };

  return (
    <div className="profilePageContainer">
      <div className="profileInfo">
        <h1> {username} </h1>
      </div>
      <div className="post-area">
        {listOfPosts.map((value, key) => {
          return (
            <div
              key={key}
              className="post"
              onClick={() => {
                history.push(`/post/${btoa(value.id)}`);
              }}
            >
              <div className="title">
                <b> {value.title} </b>
              </div>
              <div className="body">{value.postText}</div>
              <div className="footer">
                <Link
                  to={`/profile/${btoa(value.UserId)}`}
                  className="username"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >{` — ${value.username}`}</Link>
                <div className="icon">
                  <img
                    className={
                      likedPosts.includes(value.id) ? "unlikebtn" : "likebtn"
                    }
                    src={likeImg}
                    alt="Like"
                    onClick={(event) => {
                      event.stopPropagation();
                      likePost(value.id);
                    }}
                  />
                  <label>&nbsp;&nbsp;{value.Likes.length}</label>
                </div>
                <div className="line"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Profile;
