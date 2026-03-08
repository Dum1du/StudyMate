import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavigationBar";
import Footer from "./Footer";

export default function Layout() {
    return (
        <div className="flex flex-col min-h-screen">
            <NavBar/>

            <main className="flex-grow">
                <Outlet/>
            </main>

            <Footer/>
        </div>
    );
}