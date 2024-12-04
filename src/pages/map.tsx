import MapWithPins, { Pin } from '@/components/MapWithPins';
import Navbar from '@/components/ui/Navbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from "@/components/AppSidebar"
import { preDefinedLocations, locations } from '@/constants/Locations';
import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '@/context/GlobalContext';

const MapPage: React.FC = () => {
  const { selectedClasses } = useGlobalContext();
  const [center, setCenter] = useState([121.5278889480134, 25.02665988439874]);
  const [zoom, setZoom] = useState(16);
  const [pinData, setPinData] = useState<Pin[]>(preDefinedLocations);

  // Function to shift duplicate pins
  const shiftDuplicates = (data) => {
    const shiftAmount = 0.000065; // Amount to shift the coordinates
    const modifiedData = [...data];  // Create a copy of the data to avoid mutating original
    const shiftedCoordinates = [];  // To track modified coordinates
  
    // Iterate through the array
    for (let i = 0; i < modifiedData.length; i++) {
      const item = modifiedData[i];
      const lat = item.latitude;
      const lon = item.longitude;
  
      // Check if the coordinates are already shifted
      if (shiftedCoordinates.some(coord => coord.latitude === lat && coord.longitude === lon)) {
        // If the coordinate has been seen before, shift it
        item.latitude -= shiftAmount;
        item.longitude += shiftAmount;
      } else {
        // Otherwise, mark this coordinate as shifted
        shiftedCoordinates.push({ latitude: lat, longitude: lon });
      }
    }
  
    return modifiedData;
  };

  useEffect(() => {
    const coursePins = []
    selectedClasses.forEach((item) => {
      if (item.地點時間) {
        const place = item.地點時間.split(" ").slice(2,4).join("");
        const location = locations.filter((item) => {
          return item.name === place;
        })[0]
        if (location) {
          coursePins.push({...location, ...item});
        }
      };
    })
    setPinData(shiftDuplicates([...preDefinedLocations, ...coursePins]));
  }, [selectedClasses])
  return (
    <SidebarProvider className="w-full flex-1 h-screen">
      <AppSidebar />
      <div className='w-full h-screen flex flex-col'>
        <Navbar setMapCenter={setCenter} setMapZoom={setZoom} />
        <MapWithPins center={center} zoom={zoom} pinData={pinData} showAllPopup={true} />
      </div>
    </SidebarProvider>
  );
};

export default MapPage;
