import { useEffect, useState } from "react";
import ShowCards from "../productCard/showCardPc";
import FiltrarBase from "./filters/filterBase";
import FilterCards from "./filters/filterCards";
import Intro from "./intro/intro";
import Ofertas from "./ofertas/ofertas";
function App() {
  let base = FiltrarBase()
  return (
    <main>
      <Intro/>
      <ShowCards/>
      <FilterCards/>
      <Ofertas/>
    </main>
    
  );
}
export default App;