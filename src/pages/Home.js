import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import likeImg from "../images/768px-OOjs_UI_icon_heart.png";
import { AuthContext } from "../helpers/AuthContext";

function Home() {
  const [listOfPosts, setListOfPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [postOffset, setpostOffset] = useState(0);
  const { authState } = useContext(AuthContext);
  let history = useHistory();
  let postKeyHome = parseInt(sessionStorage.getItem("postKeyHome"), 10);

  const returnkey = useRef();

  useEffect(() => {
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    let cancel;
    axios
      .get(`https://shitdoug.herokuapp.com/posts/offset/${postOffset}`, {
        cancelToken: new axios.CancelToken((c) => (cancel = c)),
      })
      .then((response) => {
        setHasMore(response.data.length > 0);
        setListOfPosts((post) => {
          return [...post, response.data].flat();
        });
        if (postKeyHome) {
          if (!listOfPosts.map((post) => post.id).includes(postKeyHome)) {
            if (returnkey.current) {
              returnkey.current.scrollIntoView({
                block: "center",
                inline: "center",
              });
              sessionStorage.removeItem("postKeyHome");
            }
            setpostOffset((prevPostOffset) => prevPostOffset + 1);
          }
        }
        setLoading(false);
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
      });
    return () => cancel();
  }, [postOffset, postKeyHome, history]);

  useEffect(() => {
    if (authState.status) {
      setLikedPosts((postid) => {
        return [
          ...postid,
          listOfPosts
            .map((post) => post.Likes)
            .flat()
            .filter((like) => authState.id === like.UserId)
            .map((like) => like.PostId),
        ].flat();
      });
    }
  }, [listOfPosts, authState, history]);

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
    axios.post(
      "https://shitdoug.herokuapp.com/likes",
      { PostId: postId },
      { headers: { accessToken: localStorage.getItem("accessToken") } }
    );
    // .then((response) => {
    //   setListOfPosts(
    //     listOfPosts.map((post) => {
    //       if (post.id === postId) {
    //         if (response.data.liked) {
    //           return { ...post, Likes: [...post.Likes, 0] };
    //         } else {
    //           const likearray = post.Likes;
    //           likearray.pop();
    //           return { ...post, Likes: likearray };
    //         }
    //       } else return post;
    //     })
    //   );
    //   if (likedPosts.includes(postId)) {
    //     setLikedPosts(
    //       likedPosts.filter((id) => {
    //         return id !== postId;
    //       })
    //     );
    //   } else setLikedPosts([...likedPosts, postId]);
    // });
  };

  return (
    <div className="post-area">
      {listOfPosts.map((value, key) => {
        return (
          <div
            key={key}
            className="post"
            onClick={() => {
              sessionStorage.setItem("postKeyHome", JSON.stringify(value.id));
              history.push(`/post/${btoa(value.id)}`);
            }}
          >
            {key === listOfPosts.length - 3 && value.id === postKeyHome ? (
              <div className="title" ref={(loadPointRef, returnkey)}>
                <b> {value.title} </b>
              </div>
            ) : key === listOfPosts.length - 3 ? (
              <div className="title" ref={loadPointRef}>
                <b> {value.title} </b>
              </div>
            ) : value.id === postKeyHome ? (
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
              <a
                href={`/profile/${btoa(value.UserId)}`}
                className="username"
                onClick={(event) => {
                  event.stopPropagation();
                  sessionStorage.setItem(
                    "postKeyHome",
                    JSON.stringify(value.id)
                  );
                }}
              >{` — ${value.username}`}</a>
              <div className="icon">
                <img
                  className={
                    likedPosts.includes(value.id) ? "unlikebtn" : "likebtn"
                  }
                  src={likeImg}
                  alt="Like"
                  onClick={(event) => {
                    event.stopPropagation();
                    let likearray = value.Likes;
                    likedPosts.includes(value.id)
                      ? likearray.pop()
                      : likearray.push(0);
                    likedPosts.includes(value.id)
                      ? setLikedPosts(
                          likedPosts.filter((id) => {
                            return id !== value.id;
                          })
                        )
                      : setLikedPosts([...likedPosts, value.id]);
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
      {loading && <div className="loading">loading</div>}
    </div>
  );
}

export default Home;
