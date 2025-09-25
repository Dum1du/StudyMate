import { Link } from "react-router";
import "./StartScreen.css";

function StartScreen() {
  return (
    <div className="start-screen-container">
      <div className="content-box">
        <h1 className="title">Welcome To StudyMate!</h1>
        <p className="subtitle">This is your collaborative learning space.</p>
        <p className="question">Who are you?</p>
        <div className="button-container">
          <Link to={"/logins"} className="button student-button">
            As a Student
          </Link>
          <Link to={"/logint"} className="button teacher-button">
            As a Teacher
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StartScreen;
