import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Home from "./pages/Home";
import Post from "./pages/Post";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PageNotFound from "./pages/PageNotFound";
import Profile from "./pages/Profile";

import { AuthContext } from "./helpers/AuthContext";
import { useState, useEffect, useLayoutEffect } from "react";
import axios from "axios";

function App() {
  const [authState, setAuthState] = useState({
    username: "",
    id: 0,
    status: false,
  });

  useLayoutEffect(() => {
    let cancel;
    axios
      .get("https://shitdoug.herokuapp.com/auth/auth", {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
        cancelToken: new axios.CancelToken((c) => (cancel = c)),
      })
      .then((response) => {
        if (response.data.error) {
          console.log(response.data.error);
          setAuthState({ ...authState, status: false });
        } else {
          setAuthState({
            username: response.data.username,
            id: response.data.id,
            status: true,
          });
        }
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
      });
    return () => cancel();
  }, []);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setLogoutWarning({ opacity: 0, visibility: "hidden" });
    setAuthState({
      username: "",
      id: 0,
      status: false,
    });
  };

  const [logoutWarning, setLogoutWarning] = useState({});
  useEffect(() => {
    setLogoutWarning({ opacity: 0, visibility: "hidden" });
  }, []);

  return (
    <div className="App">
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <Router>
          <div id="Nav">
            {!authState.status ? (
              <>
                <div id="homepage">Shitdoug.gg</div>
                <a href="/login" className="Link">
                  Login
                </a>
                <a href="/register" className="Link">
                  Register
                </a>
              </>
            ) : (
              <>
                <a
                  href="/"
                  id="homepage"
                  onClick={() => {
                    sessionStorage.clear();
                    window.location.pathname === "/" &&
                      window.location.reload(true);
                  }}
                >
                  Shitdoug.gg
                </a>
                <div id="logged-in-user">
                  &nbsp; . . . . . . . &nbsp; &nbsp; logged in as: &nbsp;
                  <a
                    href={`/profile/${btoa(authState.id)}`}
                    className="username"
                  >
                    <b>{authState.username}</b>
                  </a>
                  &nbsp;&nbsp;&nbsp;
                </div>
                <button
                  id="logout"
                  onClick={() => {
                    setLogoutWarning({
                      opacity: 1,
                      visibility: "visible",
                    });
                  }}
                >
                  Logout
                </button>
                <a href="/createpost" className="Link">
                  Create A Post
                </a>
                <div
                  className="warning logoutWarning"
                  style={{
                    opacity: logoutWarning.opacity,
                    visibility: logoutWarning.visibility,
                  }}
                >
                  <div style={{ gridArea: "text", margin: "10px auto" }}>
                    Are you sure you want to logout?
                  </div>
                  <a
                    href="/login"
                    className="Link"
                    style={{ gridArea: "button1" }}
                    onClick={logout}
                  >
                    Yes
                  </a>
                  <button
                    style={{ gridArea: "button2" }}
                    onClick={() => {
                      setLogoutWarning({
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
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/createpost" exact component={CreatePost} />
            <Route path="/post/:id" exact component={Post} />
            <Route path="/login" exact component={Login} />
            <Route path="/register" exact component={Register} />
            <Route path="/profile/:id" exact component={Profile} />

            <Route path="*" exact component={PageNotFound} />
          </Switch>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
