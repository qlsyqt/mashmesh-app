import React from "react";
import { useParams } from "react-router-dom";
import AppHeader from "components/AppHeader";
import Sidebar from "components/Sidebar";
import GraphArea from "components/GraphArea";
import style from "./style.module.scss";

export default function Dashboard() {
  const { category, value } = useParams();

  return (
    <div className={style.page}>
      <AppHeader />
      <div className={style.mainContent}>
        <Sidebar />
        <GraphArea category={category} value={value} />
      </div>
    </div>
  );
}
