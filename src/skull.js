import '@kitware/vtk.js/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';

// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkImageMarchingCubes from '@kitware/vtk.js/Filters/General/ImageMarchingCubes';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';

import volumemapper from './volume';
// import controlPanel from './controller.html';
//import controlPanel from './controller.html';
function skull(){
const controlPanel = `
<table>
  <tbody>
    <tr>
      <td>
        <select class="representations" id="choose1" style="width:300%">
          <option value="0" >body</option>
          <option value="1"selected="selected">skull</option>
        </select>
      </td>
    </tr>
    <tr>
      <td>Iso value</td>
      <td>
        <input class="isoValue" type="range" min="0" max="3926" step="0.05" value="1308.6666666666667">
      </td>
    </tr>
  </tbody>
</table>
<input id="validateBtn1" type="button" value="Verify">`;

const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
  background: [0, 0, 0],
});
const renderWindow = fullScreenRenderWindow.getRenderWindow();
const renderer = fullScreenRenderWindow.getRenderer();

fullScreenRenderWindow.addController(controlPanel);

const actor = vtkActor.newInstance();
const mapper = vtkMapper.newInstance();
const marchingCube = vtkImageMarchingCubes.newInstance({
  contourValue: 0.0,
  computeNormals: true,
  mergePoints: true,
});

actor.setMapper(mapper);
mapper.setInputConnection(marchingCube.getOutputPort());

function updateIsoValue(e) {
  const isoValue = Number(e.target.value);
  marchingCube.setContourValue(isoValue);
  renderWindow.render();
}

const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
marchingCube.setInputConnection(reader.getOutputPort());

reader
  .setUrl(`https://kitware.github.io/vtk-js/data/volume/headsq.vti`, { loadData: true })
  .then(() => {
    const data = reader.getOutputData();
    const dataRange = data.getPointData().getScalars().getRange();
    const firstIsoValue = (dataRange[0] + dataRange[1]) / 3;

    const el = document.querySelector('.isoValue');
    el.setAttribute('min', dataRange[0]);
    el.setAttribute('max', dataRange[1]);
    el.setAttribute('value', firstIsoValue);
    el.addEventListener('input', updateIsoValue);

    marchingCube.setContourValue(firstIsoValue);
    renderer.addActor(actor);
    renderer.getActiveCamera().set({ position: [1, 1, 0], viewUp: [0, 0, -1] });
    renderer.resetCamera();
    renderWindow.render();
  });

global.fullScreen = fullScreenRenderWindow;
global.actor = actor;
global.mapper = mapper;
global.marchingCube = marchingCube;
 
function Validate()
  {
  var combo = document.getElementById("choose1");
  console .log(combo);
  if (combo.selectedIndex===0)
  {
    console.log(combo.selectedIndex);
    volumemapper();    
    console.log( 'volumemapper');
  }
  if(combo.selectedIndex ==1)
  {
    console.log(combo.selectedIndex);
    console.log('skull');
    skull();

  }
 }

const validateBtn = document.getElementById("validateBtn1");
validateBtn.addEventListener('click', Validate);
}
export default skull;