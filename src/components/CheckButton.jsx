import styleStorage from "../css/Storage.module.css";

export default function CheckButton({type, id, name, checked, onChange, label}) {
  return (
    <label className={styleStorage[type]} htmlFor={id}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        id={id}
      />
      {label}
    </label>
  );
}
