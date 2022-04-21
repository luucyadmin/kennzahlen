const app = ui.createProjectPanelSection();
const panel = new ui.Panel("Vergleichen");

// section for active varaint information
const section = new ui.Section('aktive Variante');
app.add(section);
app.add(new ui.Button('Varianten Vergleichen', () => panel.open()))

const actualVariantArea = new ui.LabeledValue('Fläche Total', '-  m²');
const actualVariantVolume = new ui.LabeledValue('Volume Total', '- m³');
section.add(actualVariantArea);
section.add(actualVariantVolume);

// content of variant comparsion
const barChartSectionVolume = new ui.Container();
const barChartSectionArea = new ui.Container();
// app.add(new ui.Separator());
panel.add(barChartSectionVolume);
panel.add(new ui.Separator());
panel.add(barChartSectionArea);

const createVariantBarChart = (name: string, values: any) => {

    const barChart = new ui.BarChart(name, 'm³');
    for (let item of values) {
        barChart.addSegment(item.name, Math.round(item.value));
    }
    return barChart;
}

const setVariantSectionData = (variant, origin?) => {
  console.log('setVariantSectionData from', origin, 'variant.name', variant?.name, 'variant.floorArea', variant?.floorArea);
  if (variant && typeof variant.floorArea === 'number') {
      section.name = variant.name;
      actualVariantArea.value = Math.round(variant.floorArea).toLocaleString('de-CH')  + ' m²';
      actualVariantVolume.value = Math.round(variant.volume).toLocaleString('de-CH') + ' m³';
  } else {
      section.name = 'keine aktive Variante';
      actualVariantArea.value = '-  m²';
      actualVariantVolume.value = '- m³';
  }
};

data.onProjectSelect.subscribe(project => {
    console.log('data.onProjectSelect', 'project.name', project?.name);
    if (project) {

        // get informations of active variant
        project.onVariantSelect.subscribe((variant) => {
          setVariantSectionData(variant, 'project.onVariantSelect');
        });

        // get informations of all variants
        project.getVariants().then(projectVars => {
            setVariantSectionData(project.selectedVariant, 'project.getVariants');
            barChartSectionVolume.removeAllChildren();
            barChartSectionArea.removeAllChildren();

            // get max values of floor and volume for charting
            let _maxVolume = 0;
            let _maxFloorArea = 0;
            for (let varData of projectVars) {
                if (varData.volume > _maxVolume) {
                    _maxVolume = varData.volume;
                }
                if (varData.floorArea > _maxFloorArea) {
                    _maxFloorArea = varData.floorArea;
                }
            }
            const maxVolume = _maxVolume;
            const maxFloorArea = _maxFloorArea;

            // list all variant volumes
            barChartSectionVolume.add(new ui.Paragraph('Variantenvergleich Volumen'))
            for (let varData of projectVars) {
                // bar chart data
                const varVol = [{name:'Total Volume', value:varData.volume}];

                // create labeled values instead of bar chart
                barChartSectionVolume.add(new ui.LabeledValue(varData.name, Math.round(varData.volume).toLocaleString('de-CH') + ' m³'))
                // barChartSectionVolume.add(createVariantBarChart(varData.name, varVol));
            }

            // list all variant floor areas
            barChartSectionArea.add(new ui.Paragraph('Variantenvergleich Fläche'))
            for (let varData of projectVars) {
                // bar chart data
                const varVol = [{name:'Total Volume', value:varData.floorArea}];

                // create labeled values instead of bar chart
                barChartSectionArea.add(new ui.LabeledValue(varData.name, Math.round(varData.floorArea).toLocaleString('de-CH') + ' m²'))
                // barChartSectionArea.add(createVariantBarChart(varData.name, varVol));
            }

        });
    }
})