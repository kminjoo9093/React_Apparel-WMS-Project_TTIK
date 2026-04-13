import { useState, useEffect } from "react";
import serverUrl from "../../db/server.json";

const SERVER_URL = serverUrl.SERVER_URL;

function useStorageData(selectedStorage, selectedZone) {
  // 데이터
  const [zoneOptions, setZoneOptions] = useState([]); //구역
  const [rackOptions, setRackOptions] = useState([]); //선반

  // 선택한 창고 별 구역 옵션 리스트
  useEffect(() => {
    if (!selectedStorage) return;

    const getZoneData = async () => {
      try {
        const res = await fetch(
          `${SERVER_URL}/ttik/storage/zones?storageSn=${selectedStorage}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (res.ok) {
          const zoneData = await res.json();

          setZoneOptions(zoneData);
        }
      } catch (error) {
        return [];
      }
    };
    getZoneData();
  }, [selectedStorage, SERVER_URL]);

  // 선택한 구역 별 선반 옵션 리스트
  useEffect(() => {
    if (!selectedZone) return;

    const getRackData = async () => {
      try {
        const res = await fetch(
          `${SERVER_URL}/ttik/storage/racks?zoneSn=${selectedZone}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (res.ok) {
          const rackData = await res.json();
          console.log(rackData);

          setRackOptions(rackData);
        }
      } catch (error) {
        console.log(error);
        return [];
      }
    };
    getRackData();
  }, [selectedZone, SERVER_URL]);

  return { zoneOptions, rackOptions };
}

export default useStorageData;
