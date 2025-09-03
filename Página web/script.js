// Implementación de un sistema de gráficos simple sin dependencias externas
class SimpleChart {
    constructor(ctx) {
        this.ctx = ctx;
        this.config = {};
    }
    
    init(type, data, options) {
        this.config = { type, data, options: options || {} };
        this.render();
        return this;
    }
    
    update() {
        this.render();
    }
    
    render() {
        const { type, data, options } = this.config;
        const canvas = this.ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // Limpiar canvas
        this.ctx.clearRect(0, 0, width, height);
        
        if (type === 'bar') {
            this.renderBarChart(data, options, width, height);
        }
    }
    
    renderBarChart(data, options, width, height) {
        const { datasets, labels } = data;
        const datasetCount = datasets.length;
        const labelCount = labels.length;
        
        // Calcular dimensiones
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const barWidth = (chartWidth / labelCount) * 0.7;
        const groupWidth = chartWidth / labelCount;
        const maxValue = this.getMaxValue(datasets);
        
        // Dibujar ejes
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#d4d4d8';
        this.ctx.lineWidth = 1;
        
        // Eje Y
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, height - padding);
        
        // Eje X
        this.ctx.moveTo(padding, height - padding);
        this.ctx.lineTo(width - padding, height - padding);
        this.ctx.stroke();
        
        // Dibujar marcas en eje Y
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#52525b';
        this.ctx.font = '12px sans-serif';
        
        const yStep = maxValue / 5;
        for (let i = 0; i <= 5; i++) {
            const value = i * yStep;
            const y = height - padding - (value / maxValue) * chartHeight;
            
            this.ctx.beginPath();
            this.ctx.moveTo(padding - 5, y);
            this.ctx.lineTo(padding, y);
            this.ctx.stroke();
            
            this.ctx.fillText(value.toFixed(0), padding - 10, y);
        }
        
        // Dibujar barras
        const colors = ['#3b82f6', '#f97316', '#dc2626'];
        
        for (let i = 0; i < labelCount; i++) {
            const x = padding + i * groupWidth + (groupWidth - barWidth * datasetCount) / 2;
            
            for (let j = 0; j < datasetCount; j++) {
                const value = datasets[j].data[i];
                const barHeight = (value / maxValue) * chartHeight;
                const barX = x + j * barWidth;
                const barY = height - padding - barHeight;
                
                this.ctx.fillStyle = colors[j % colors.length];
                this.ctx.fillRect(barX, barY, barWidth - 2, barHeight);
                
                // Etiqueta de valor
                if (value > maxValue * 0.05) {
                    this.ctx.fillStyle = '#fff';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'bottom';
                    this.ctx.font = '10px sans-serif';
                    this.ctx.fillText(value.toFixed(0), barX + barWidth/2, barY - 2);
                }
            }
            
            // Etiqueta del eje X
            this.ctx.fillStyle = '#52525b';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            this.ctx.font = '12px sans-serif';
            this.ctx.fillText(labels[i], padding + i * groupWidth + groupWidth/2, height - padding + 5);
        }
        
        // Leyenda
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '12px sans-serif';
        
        const legendX = width - 150;
        const legendY = padding;
        
        for (let j = 0; j < datasetCount; j++) {
            this.ctx.fillStyle = colors[j % colors.length];
            this.ctx.fillRect(legendX, legendY + j * 20, 15, 15);
            
            this.ctx.fillStyle = '#52525b';
            this.ctx.fillText(datasets[j].label, legendX + 20, legendY + j * 20 + 7.5);
        }
    }
    
    getMaxValue(datasets) {
        let max = 0;
        for (const dataset of datasets) {
            for (const value of dataset.data) {
                if (value > max) max = value;
            }
        }
        return max * 1.1; // Añadir 10% de espacio
    }
    
    data(newData) {
        if (newData) this.config.data = newData;
        return this.config.data;
    }
    
    options(newOptions) {
        if (newOptions) this.config.options = newOptions;
        return this.config.options;
    }
}

// Datos de los tanques
const tanqueData = {
    'TIA-10': {
        title: 'TIA-10 (Tolueno)',
        designData: {
            'Servicio / Fluido': 'Tolueno',
            'Volumen Total (Vtk)': '14 m³',
            'Diámetro (D)': '2.30 m',
            'Altura (H)': '3.60 m',
            'Punto de Inflamación': '4 °C (Volátil)',
            'Caudal Llenado (Vpf)': '20 m³/h',
            'Caudal Vaciado (Vpe)': '30 m³/h',
        },
        results: {
            pressure: 43.44,
            vacuum: 71.23,
            emergency: 7026
        },
        calculations: `
            <h4 class="formula-title">Venteo Normal – Presión (Out-breathing)</h4>
            <p>El Tolueno es un líquido volátil (Punto de Inflamación < 37.8°C), por lo que se aplica un factor de seguridad de 2.0 al caudal de llenado.</p>
            <div class="formula-box">
                <div>V<sub>Total,Out</sub> = (Factor<sub>volatilidad</sub> × V<sub>pf</sub>) + (Y × V<sub>tk</sub><sup>0.9</sup>)</div>
                <div>V<sub>Total,Out</sub> = (2.0 × 20) + (0.32 × 14<sup>0.9</sup>)</div>
                <div>V<sub>Total,Out</sub> = 40 + 3.44 = <strong>43.44 Nm³/h</strong></div>
            </div>
            
            <h4 class="formula-title">Venteo Normal – Vacío (In-breathing)</h4>
            <div class="formula-box">
                <div>V<sub>Total,In</sub> = V<sub>pe</sub> + (C × V<sub>tk</sub><sup>0.7</sup>)</div>
                <div>V<sub>Total,In</sub> = 30 + (6.5 × 14<sup>0.7</sup>)</div>
                <div>V<sub>Total,In</sub> = 30 + 41.23 = <strong>71.23 Nm³/h</strong></div>
            </div>

            <h4 class="formula-title">Venteo de Emergencia por Fuego</h4>
            <p>Primero, se calcula el área de transferencia de calor expuesta al fuego (Área Inundada, A<sub>TWS</sub>).</p>
            <div class="formula-box">
                <div>A<sub>TWS</sub> = π × D × H = π × 2.30 × 3.60 = <strong>26.01 m²</strong></div>
            </div>
            <p>Luego, con esta área, se calcula el caudal de emergencia.</p>
            <div class="formula-box">
                <div>q = 208.2 × F × A<sub>TWS</sub><sup>0.82</sup> = 208.2 × 1.0 × (26.01)<sup>0.82</sup> = <strong>7,026 Nm³/h</strong></div>
            </div>
        `,
        recommendations: [
            { service: 'Normal – Presión', flow: 43.44, setpoint: '+10 – +20', connection: '2" – 3"' },
            { service: 'Normal – Vacío', flow: 71.23, setpoint: '-2.0', connection: '2" – 3"' },
            { service: '<strong>Emergencia</strong>', flow: '<strong>7,026</strong>', setpoint: '~22', connection: '6" – 8"' }
        ]
    },
    'TIA-11': {
        title: 'TIA-11 (Aguarrás Mineral)',
        designData: {
            'Servicio / Fluido': 'Aguarrás Mineral (Nafta)',
            'Volumen Total (Vtk)': '7 m³',
            'Diámetro (D)': '2.30 m',
            'Altura (H)': '1.80 m',
            'Punto de Inflamación': '38 °C (No Volátil)',
            'Caudal Llenado (Vpf)': '20 m³/h',
            'Caudal Vaciado (Vpe)': '30 m³/h',
        },
        results: {
            pressure: 21.84,
            vacuum: 55.38,
            emergency: 4070
        },
        calculations: `
            <h4 class="formula-title">Venteo Normal – Presión (Out-breathing)</h4>
            <p>El Aguarrás es un líquido no volátil (Punto de Inflamación > 37.8°C), por lo que se aplica un factor de 1.0.</p>
            <div class="formula-box">
                <div>V<sub>Total,Out</sub> = (1.0 × 20) + (0.32 × 7<sup>0.9</sup>) = 20 + 1.84 = <strong>21.84 Nm³/h</strong></div>
            </div>
            
            <h4 class="formula-title">Venteo Normal – Vacío (In-breathing)</h4>
            <div class="formula-box">
                <div>V<sub>Total,In</sub> = 30 + (6.5 × 7<sup>0.7</sup>) = 30 + 25.38 = <strong>55.38 Nm³/h</strong></div>
            </div>

            <h4 class="formula-title">Venteo de Emergencia por Fuego</h4>
            <div class="formula-box">
                <div>A<sub>TWS</sub> = π × 2.30 × 1.80 = <strong>13.01 m²</strong></div>
            </div>
            <div class="formula-box">
                <div>q = 208.2 × 1.0 × (13.01)<sup>0.82</sup> = <strong>4,070 Nm³/h</strong></div>
            </div>
        `,
        recommendations: [
            { service: 'Normal – Presión', flow: 21.84, setpoint: '+10 – +20', connection: '2"' },
            { service: 'Normal – Vacío', flow: 55.38, setpoint: '-2.0', connection: '2"' },
            { service: '<strong>Emergencia</strong>', flow: '<strong>4,070</strong>', setpoint: '~22', connection: '4" – 6"' }
        ]
    },
    'TIA-13': {
        title: 'TIA-13 (Resinas)',
        designData: {
            'Servicio / Fluido': 'Resinas',
            'Volumen Total (Vtk)': '29 m³',
            'Diámetro (D)': '3.05 m',
            'Altura (H)': '4.20 m',
            'Punto de Inflamación': '27 °C (Volátil)',
            'Caudal Llenado (Vpf)': '7 m³/h',
            'Caudal Vaciado (Vpe)': '7 m³/h',
        },
        results: {
            pressure: 20.63,
            vacuum: 75.64,
            emergency: 8995
        },
        calculations: `
            <h4 class="formula-title">Venteo Normal – Presión (Out-breathing)</h4>
            <p>Las Resinas son volátiles (Punto de Inflamación < 37.8°C), por lo que se aplica un factor de 2.0.</p>
            <div class="formula-box">
                <div>V<sub>Total,Out</sub> = (2.0 × 7) + (0.32 × 29<sup>0.9</sup>) = 14 + 6.63 = <strong>20.63 Nm³/h</strong></div>
            </div>
            
            <h4 class="formula-title">Venteo Normal – Vacío (In-breathing)</h4>
            <div class="formula-box">
                <div>V<sub>Total,In</sub> = 7 + (6.5 × 29<sup>0.7</sup>) = 7 + 68.64 = <strong>75.64 Nm³/h</strong></div>
            </div>

            <h4 class="formula-title">Venteo de Emergencia por Fuego</h4>
            <div class="formula-box">
                <div>A<sub>TWS</sub> = π × 3.05 × 4.20 = <strong>40.24 m²</strong></div>
            </div>
            <div class="formula-box">
                <div>q = 208.2 × 1.0 × (40.24)<sup>0.82</sup> = <strong>8,995 Nm³/h</strong></div>
            </div>
        `,
        recommendations: [
            { service: 'Normal – Presión', flow: 20.63, setpoint: '+10 – +20', connection: '2" – 3"' },
            { service: 'Normal – Vacío', flow: 75.64, setpoint: '-2.0', connection: '2" – 3"' },
            { service: '<strong>Emergencia</strong>', flow: '<strong>8,995</strong>', setpoint: '~22', connection: '8" – 10"' }
        ]
    },
    'TIA-14': {
        title: 'TIA-14 (Resinas)',
        designData: {
            'Servicio / Fluido': 'Resinas',
            'Volumen Total (Vtk)': '29 m³',
            'Diámetro (D)': '3.05 m',
            'Altura (H)': '4.20 m',
            'Punto de Inflamación': '31 °C (Volátil)',
            'Caudal Llenado (Vpf)': '7 m³/h',
            'Caudal Vaciado (Vpe)': '7 m³/h',
        },
        results: {
            pressure: 20.63,
            vacuum: 75.64,
            emergency: 8995
        },
        calculations: `
            <h4 class="formula-title">Venteo Normal – Presión (Out-breathing)</h4>
            <p>Las Resinas son volátiles (Punto de Inflamación < 37.8°C), por lo que se aplica un factor de 2.0.</p>
            <div class="formula-box">
                <div>V<sub>Total,Out</sub> = (2.0 × 7) + (0.32 × 29<sup>0.9</sup>) = 14 + 6.63 = <strong>20.63 Nm³/h</strong></div>
            </div>
            
            <h4 class="formula-title">Venteo Normal – Vacío (In-breathing)</h4>
            <div class="formula-box">
                <div>V<sub>Total,In</sub> = 7 + (6.5 × 29<sup>0.7</sup>) = 7 + 68.64 = <strong>75.64 Nm³/h</strong></div>
            </div>

            <h4 class="formula-title">Venteo de Emergencia por Fuego</h4>
            <div class="formula-box">
                <div>A<sub>TWS</sub> = π × 3.05 × 4.20 = <strong>40.24 m²</strong></div>
            </div>
            <div class="formula-box">
                <div>q = 208.2 × 1.0 × (40.24)<sup>0.82</sup> = <strong>8,995 Nm³/h</strong></div>
            </div>
        `,
        recommendations: [
            { service: 'Normal – Presión', flow: 20.63, setpoint: '+10 – +20', connection: '2" – 3"' },
            { service: 'Normal – Vacío', flow: 75.64, setpoint: '-2.0', connection: '2" – 3"' },
            { service: '<strong>Emergencia</strong>', flow: '<strong>8,995</strong>', setpoint: '~22', connection: '8" – 10"' }
        ]
    }
};

let individualChart;
let comparisonChart;
let selectedTankId = 'TIA-10';

function updateDashboard(tankId) {
    selectedTankId = tankId;
    const data = tanqueData[tankId];

    document.getElementById('tank-title-1').textContent = data.title;
    document.getElementById('tank-title-2').textContent = data.title;
    
    const designTable = document.getElementById('design-data-table');
    designTable.innerHTML = '';
    for (const [key, value] of Object.entries(data.designData)) {
        const row = document.createElement('tr');
        row.innerHTML = `<td class="font-medium">${key}</td><td>${value}</td>`;
        designTable.appendChild(row);
    }

    const calculationDetails = document.getElementById('calculation-details');
    calculationDetails.innerHTML = data.calculations;
    
    const recommendationsTable = document.getElementById('recommendations-table');
    recommendationsTable.innerHTML = '';
    data.recommendations.forEach(rec => {
         const row = document.createElement('tr');
         row.innerHTML = `<td class="font-medium">${rec.service}</td><td>${rec.flow}</td><td>${rec.setpoint}</td><td>${rec.connection}</td>`;
         recommendationsTable.appendChild(row);
    });

    updateIndividualChart(data);
    updateSelectorButtons();
}

function updateSelectorButtons() {
    const buttons = document.querySelectorAll('#tank-selector-container button');
    buttons.forEach(button => {
        if(button.dataset.tankId === selectedTankId){
            button.classList.remove('btn-inactive');
            button.classList.add('btn-active');
        } else {
            button.classList.remove('btn-active');
            button.classList.add('btn-inactive');
        }
    });
}

function createSelectorButtons() {
    const container = document.getElementById('tank-selector-container');
    Object.keys(tanqueData).forEach(tankId => {
        const button = document.createElement('button');
        button.textContent = tanqueData[tankId].title;
        button.dataset.tankId = tankId;
        button.className = 'btn btn-inactive';
        button.onclick = () => updateDashboard(tankId);
        container.appendChild(button);
    });
}

function updateIndividualChart(data) {
    const ctx = document.getElementById('individualTankChart').getContext('2d');
    const chartData = {
        labels: ['Normal (Presión)', 'Normal (Vacío)', 'Emergencia (Fuego)'],
        datasets: [{
            label: 'Caudal Requerido (Nm³/h)',
            data: [data.results.pressure, data.results.vacuum, data.results.emergency],
            backgroundColor: [
                'rgba(59, 130, 246, 0.6)',
                'rgba(249, 115, 22, 0.6)',
                'rgba(220, 38, 38, 0.6)'
            ],
            borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(249, 115, 22, 1)',
                'rgba(220, 38, 38, 1)'
            ],
            borderWidth: 1
        }]
    };

    if (individualChart) {
        individualChart.data = chartData;
        individualChart.update();
    } else {
        individualChart = new SimpleChart(ctx).init('bar', chartData);
    }
}

function createComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    const datasets = [
        {
            label: 'Normal (Presión)',
            data: Object.values(tanqueData).map(t => t.results.pressure),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
        },
        {
            label: 'Normal (Vacío)',
            data: Object.values(tanqueData).map(t => t.results.vacuum),
            backgroundColor: 'rgba(249, 115, 22, 0.7)',
            borderColor: 'rgba(249, 115, 22, 1)',
            borderWidth: 1
        },
        {
            label: 'Emergencia (Fuego)',
            data: Object.values(tanqueData).map(t => t.results.emergency),
            backgroundColor: 'rgba(220, 38, 38, 0.7)',
            borderColor: 'rgba(220, 38, 38, 1)',
            borderWidth: 1
        }
    ];

    comparisonChart = new SimpleChart(ctx).init('bar', {
        labels: Object.keys(tanqueData),
        datasets: datasets
    });
}

document.addEventListener("DOMContentLoaded", function() {
    createSelectorButtons();
    updateDashboard('TIA-10');
    createComparisonChart();
});