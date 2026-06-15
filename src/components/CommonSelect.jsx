export const CommonSelect = ({defaultOption, dataList, dataValue, dataText, ...props}) => {
  
  return <>
    <select {...props}>
        <option value="">{defaultOption}</option>
        {dataList?.map((record) => (
            <option key={record[dataValue]} value={record[dataValue]}>{record[dataText]}</option>
        ))}
    </select>
  </>
}