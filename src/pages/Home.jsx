import React from "react";
import { Link, useNavigate } from "react-router-dom"
import Dashboard from "./Dashboard";


const Home = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/about");
  };
  return (
    <div className="" >
        <Dashboard></Dashboard>
        <Link to="/About" className="text-teal-600 underline hover:text-teal-800">
        About Us
        </Link>
    </div>
  );
};

export default Home;