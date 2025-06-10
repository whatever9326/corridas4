
import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function GeneradorSKUs() {
  const [data, setData] = useState([]);
  const [pedido, setPedido] = useState('');
  const [modelo, setModelo] = useState('');
  const [color, setColor] = useState('');
  const [cajas, setCajas] = useState(1);
  const [resultado, setResultado] = useState([]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setData(json);
    };
    reader.readAsBinaryString(file);
  };

  const generarSKUs = () => {
    const fila = data.find(row =>
      String(row.PEDIDO).toUpperCase() === pedido.toUpperCase() &&
      String(row.MODELO).toUpperCase() === modelo.toUpperCase() &&
      String(row.COLOR).toUpperCase() === color.toUpperCase()
    );
    if (!fila) return alert("No se encontró esa combinación");

    const tallas = [23,24,25,26,27,28,29,30];
    const resultado = tallas.map(talla => {
      const cantidad = parseInt(fila[talla] === '-' ? 0 : fila[talla] || 0);
      return {
        sku: `${modelo}-${color}-${talla}-MX`,
        cantidad: cantidad * cajas
      };
    }).filter(r => r.cantidad > 0);
    setResultado(resultado);
  };

  const exportarExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(resultado);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SKUs");
    XLSX.writeFile(workbook, "skus_generados.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Generador de SKUs por corrida</h2>
      <div style={{ marginBottom: 10 }}>
        <input type="file" accept=".xlsx" onChange={handleUpload} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <input placeholder="Pedido" value={pedido} onChange={e => setPedido(e.target.value)} />
        <input placeholder="Modelo" value={modelo} onChange={e => setModelo(e.target.value)} />
        <input placeholder="Color" value={color} onChange={e => setColor(e.target.value)} />
        <input placeholder="Cajas" type="number" value={cajas} onChange={e => setCajas(Number(e.target.value))} />
        <button onClick={generarSKUs}>Generar</button>
      </div>
      {resultado.length > 0 && (
        <div>
          <table border="1" cellPadding="5">
            <thead>
              <tr><th>SKU</th><th>Cantidad</th></tr>
            </thead>
            <tbody>
              {resultado.map((r, i) => (
                <tr key={i}><td>{r.sku}</td><td>{r.cantidad}</td></tr>
              ))}
            </tbody>
          </table>
          <button style={{ marginTop: 10 }} onClick={exportarExcel}>Exportar Excel</button>
        </div>
      )}
    </div>
  );
}
