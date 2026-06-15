import styleMainDashBoard from "../css/MainDashboard.module.css";

export default function PageInfo({title, description}) {
  return (
    <div className={styleMainDashBoard.welcomeSection}>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
