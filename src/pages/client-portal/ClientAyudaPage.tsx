import type { ClientTab } from "../../layouts/ClientPortalLayout";

export function ClientAyudaPage({
  onNavigate,
}: {
  onNavigate: (tab: ClientTab) => void;
}) {
  const opciones: { tab: ClientTab; title: string; text: string }[] = [
    {
      tab: "resumen",
      title: "Mi resumen",
      text: "Consulta capital pendiente, próximo pago y estado general de tu cuenta. El crédito disponible se mostrará cuando el negocio lo informe.",
    },
    {
      tab: "compras",
      title: "Mis compras",
      text: "Revisa tus compras a crédito. Desde cada operación puedes abrir el plan de pagos o el detalle del pago único.",
    },
    {
      tab: "pagos",
      title: "Mis pagos",
      text: "Consulta obligaciones pendientes, pagos realizados, vencimientos y posibles intereses por mora.",
    },
  ];
  const conceptos = [
    [
      "Capital pendiente",
      "Parte del dinero financiado que todavía falta amortizar.",
    ],
    [
      "Crédito disponible",
      "Monto que aún puedes utilizar según tu límite autorizado.",
    ],
    [
      "Fecha de vencimiento",
      "Día pactado para cancelar la obligación completa.",
    ],
    [
      "Mora",
      "Interés adicional que puede generarse cuando el pago se realiza después del vencimiento.",
    ],
  ];
  const preguntas = [
    [
      "¿Puedo pagar solo una parte?",
      "No. JADES registra el pago por el total exigible de la obligación.",
    ],
    [
      "¿Qué ocurre si pago tarde?",
      "El sistema calcula los días de atraso y, cuando corresponde, agrega intereses por mora.",
    ],
    [
      "¿Dónde veo mi cronograma?",
      "Ingresa a Mis compras y abre el plan de la operación financiada en meses.",
    ],
  ];
  return (
    <div className="client-sections client-help">
      <div className="client-heading">
        <h2>Ayuda</h2>
        <p>Guía para consultar tus compras, cronogramas y pagos.</p>
      </div>
      <div className="client-help-intro">
        <h3>Tu cuenta reúne todo lo relacionado con tus créditos</h3>
        <p>
          Desde aquí puedes revisar cuánto debes, cuándo vence tu próximo pago y
          el detalle de cada compra sin modificar las condiciones pactadas. Los
          pagos los registra el negocio. El pago único puede cancelarse antes del vencimiento; en créditos mensuales se permite adelantar la cuota correspondiente y liquidar según las reglas del backend.
        </p>
      </div>
      <h3>Dónde encontrar cada información</h3>
      <div className="client-help-grid three">
        {opciones.map((o, i) => (
          <button
            className="client-panel"
            key={o.tab}
            onClick={() => onNavigate(o.tab)}
          >
            <small>OPCIÓN {i + 1}</small>
            <h4>{o.title}</h4>
            <p>{o.text}</p>
          </button>
        ))}
      </div>
      <h3>Cómo leer tu crédito</h3>
      <div className="client-help-grid four">
        {conceptos.map(([title, text]) => (
          <div className="client-panel" key={title}>
            <h4>{title}</h4>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <h3>Preguntas frecuentes</h3>
      <div className="client-help-grid three">
        {preguntas.map(([title, text]) => (
          <div className="client-panel" key={title}>
            <h4>{title}</h4>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
