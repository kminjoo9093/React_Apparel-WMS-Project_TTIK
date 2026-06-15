import React from "react";
import ReactDOM from "react-dom/client";
import Ttik from "./Ttik";
import { BrowserRouter } from "react-router-dom";
import "./css/Global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Ttik />
    </QueryClientProvider>
  </BrowserRouter>,
);
