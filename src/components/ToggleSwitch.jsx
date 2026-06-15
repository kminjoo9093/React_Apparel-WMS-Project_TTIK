import styleStorage from "../css/Storage.module.css";

export default function ToggleSwitch({id, name, checked, onChange, labelOn, labelOff}) {
  return (
    <label
      htmlFor={id}
      className={`${styleStorage.disableButton} ${checked ? styleStorage.disable : ""}`}
    >
      <div className={styleStorage.disableText}>
        {checked ? labelOn : labelOff}
      </div>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        id={id}
      />
    </label>
  );
}
