import React, { useEffect } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";

function CreatePost() {
  let history = useHistory();
  const initialValues = {
    title: "",
    postText: "",
  };
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      history.push("/login");
    }
  }, [history]);
  const validationSchema = Yup.object().shape({
    title: Yup.string().required("(post title is required)"),
    // postText: Yup.string().required(),
  });
  const onSubmit = (data) => {
    axios
      .post("https://shitdoug.herokuapp.com/posts", data, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then(() => {
        axios
          .get("https://shitdoug.herokuapp.com/posts", {
            headers: { accessToken: localStorage.getItem("accessToken") },
          })
          .then((response) => {
            let newpostId = response.data.listOfPosts[0].id;
            history.push(`/post/${btoa(newpostId)}`);
          });
      });
  };
  return (
    <div className="createPostPage">
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        <Form>
          <label>Title: </label>
          <Field name="title" placeholder="(Ex. Title)" autoComplete="off" />
          <ErrorMessage name="title" component="span" />
          <br />
          <label>Post: </label>
          <Field name="postText" placeholder="(Ex. Post)" autoComplete="off" />
          <ErrorMessage name="postText" component="span" />
          <br />
          <button type="submit"> Create Post</button>
        </Form>
      </Formik>
    </div>
  );
}

export default CreatePost;
