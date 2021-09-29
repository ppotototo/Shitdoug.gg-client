import React, { useRef, useCallback } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import likeImg from "../images/768px-OOjs_UI_icon_heart.png";

function Home() {
  const [listOfPosts, setListOfPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [postOffset, setpostOffset] = useState(0);
  let history = useHistory();
  let postKey = parseInt(sessionStorage.getItem("postKey"), 10);

  const returnkey = useRef();

  useEffect(() => {
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };
  }, [])

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      history.push("/login");
    } else {
      setLoading(true);
      let cancel;
      axios
        .get(
          `http://localhost:3001/posts/offset/${postOffset}`,
          {
            headers: { accessToken: localStorage.getItem("accessToken") },
          },
          { cancelToken: new axios.CancelToken((c) => (cancel = c)) }
        )
        .then((response) => {
          setListOfPosts((post) => {
            return [...post, response.data.listOfPosts].flat();
          });
          setLikedPosts((postid) => {
            return [
              ...postid,
              response.data.likedPosts.map((like) => {
                return like.PostId;
              }),
            ].flat();
          });
          setHasMore(response.data.listOfPosts.length > 0);
          if (postKey) {
            if (
              !response.data.listOfPosts
                .map((post) => post.id)
                .includes(postKey)
            )
              if (returnkey.current) {
                console.log("sex")
                returnkey.current.scrollIntoView({
                  block: "center",
                  inline: "center",
                });
                sessionStorage.removeItem("postKey");
              }
            setpostOffset((prevPostOffset) => prevPostOffset + 1);
          }
          setLoading(false);
        })
        .catch((e) => {
          if (axios.isCancel(e)) return;
        });
      return () => cancel();
    }
  }, [postOffset,history,postKey]);

  const observer = useRef();
  const loadPointRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setpostOffset((prevPostOffset) => prevPostOffset + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const likePost = (postId) => {
    axios
      .post(
        "http://localhost:3001/likes",
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
    <div className="post-area">
      {listOfPosts.map((value, key) => {
        return (
          <div
            key={key}
            className="post"
            onClick={() => {
              sessionStorage.setItem("postKey", JSON.stringify(value.id));
              history.push(`/post/${btoa(value.id)}`);
            }}
          >
            {key === listOfPosts.length - 3 && value.id === postKey ? (
              <div className="title" ref={(loadPointRef, returnkey)}>
                <b> {value.title} </b>
              </div>
            ) : key === listOfPosts.length - 3 ? (
              <div className="title" ref={loadPointRef}>
                <b> {value.title} </b>
              </div>
            ) : value.id === postKey ? (
              <div className="title" ref={returnkey}>
                <b> {value.title} </b>
              </div>
            ) : (
              <div className="title">
                <b> {value.title} </b>
              </div>
            )}
            <div className="body">{value.postText}</div>
            <div className="footer">
              <Link
                to={`/profile/${btoa(value.UserId)}`}
                className="username"
                onClick={(event) => {
                  event.stopPropagation();
                  sessionStorage.setItem("postKey", JSON.stringify(value.id));
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
  );
}

export default Home;
