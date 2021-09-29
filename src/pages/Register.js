import React, { useContext } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function Register() {
  const initialValues = {
    username: "",
    password: "",
  };
  const validationSchema = Yup.object().shape({
    username: Yup.string().min(6).max(20).required(),
    password: Yup.string().min(6).max(20).required(),
  });
  const { setAuthState } = useContext(AuthContext);

  let history = useHistory();
  const onSubmit = (data) => {
    axios.post("http://localhost:3001/auth", data).then((r) => {
      const rdata = r.data;
      axios
        .post("http://localhost:3001/auth/login", rdata)
        .then((response) => {
          if (response.data.error) {
            alert(response.data.error);
          } else {
            localStorage.setItem("accessToken", response.data.token);
            setAuthState({
              username: response.data.username,
              id: response.data.id,
              status: true,
            });
            history.push("/");
          }
        });
    });
  };
  return (
    <div className="Register">
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        <Form>
          <label>Username: </label>
          <Field name="username" autoComplete="off" />
          <ErrorMessage name="username" component="span" />
          <br />
          <label>Password: </label>
          <Field type="password" name="password" autoComplete="off" />
          <ErrorMessage name="password" component="span" />
          <br />
          <button type="submit"> Register</button>
        </Form>
      </Formik>
    </div>
  );
}

export default Register;
