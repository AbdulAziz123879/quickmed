
import {
  Bike,
  Users,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Package,
  Store,
  Mail,
  Truck,
  ChevronDown,
  Hash,
  Wallet,
} from "lucide-react";
import { C } from "../theme";


function DetailPage({ detail, onBack }) {
  const { type, data } = detail;

  const titleFor = {
    rider: data.name,
    customer: data.name,
    order: data.id,
    store: data.name,
  }[type];


  const iconFor = { rider: Bike, customer: Users, order: Package, store: Store }[
    type
  ];
  const Icon = iconFor;

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "#94A3B8",
          cursor: "pointer",
          fontSize: 13.5,
          fontWeight: 600,
          marginBottom: 22,
          padding: 0,
        }}
      >
        <ChevronDown size={16} style={{ transform: "rotate(90deg)" }} /> Back
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "#111A2B",
            border: "1px solid #1E293B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={24} color={C.primary} />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{titleFor}</div>
          <div style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 2 }}>
            {type === "rider" && `Rider · ${data.id}`}
            {type === "customer" && `Customer · #${data.id}`}
            {type === "order" && `Order`}
            {type === "store" && `Medical store${data.license_number ? ` · Lic# ${data.license_number}` : ""}`}
          </div>
        </div>
      </div>

      {type === "rider" && <RiderDetail data={data} />}
      {type === "customer" && <CustomerDetail data={data} />}
      {type === "order" && <OrderDetail data={data} />}
      {type === "store" && <StoreDetail data={data} />}
    </div>
  );
}

/* ---------- shared field row helpers ---------- */
function FieldRow({ label, value, icon: Icon }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 0",
        borderBottom: "1px solid #1E293B",
      }}
    >
      {Icon && <Icon size={14} color="#94A3B8" style={{ flexShrink: 0 }} />}
      <div style={{ fontSize: 12, color: "#94A3B8", minWidth: 140 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#F1F5F9" }}>
        {String(value)}
      </div>
    </div>
  );
}

function DetailCard({ title, children }) {
  return (
    <div
      style={{
        background: "#111A2B",
        border: "1px solid #1E293B",
        borderRadius: 16,
        padding: "8px 20px",
        marginBottom: 20,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#94A3B8",
            padding: "14px 0 4px",
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div
      style={{
        background: "#111A2B",
        border: "1px solid #1E293B",
        borderRadius: 14,
        padding: 16,
        flex: 1,
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 800, color: color || "#F1F5F9" }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

/* ---------- rider detail ---------- */
function RiderDetail({ data }) {
  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatPill label="Deliveries" value={data.delivery_count ?? 0} />
        <StatPill
          label="Total earned"
          value={`৳${Number(data.total_earnings || 0).toLocaleString()}`}
          color="#34D399"
        />
        {data.rating && (
          <StatPill label="Rating" value={Number(data.rating).toFixed(1)} color="#F59E0B" />
        )}
      </div>
      <DetailCard title="Rider info">
        <FieldRow label="Rider ID" value={data.id} icon={Hash} />
        <FieldRow label="Full name" value={data.name} icon={User} />
        <FieldRow label="Phone" value={data.phone} icon={Phone} />
        <FieldRow label="Email" value={data.email} icon={Mail} />
        <FieldRow label="Vehicle" value={data.vehicle} icon={Truck} />
        <FieldRow label="Vehicle number" value={data.vehicleNumber || data.vehicle_number} />
      </DetailCard>
    </>
  );
}

/* ---------- customer detail ---------- */
function CustomerDetail({ data }) {
  const orders = data.orders || [];
  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatPill label="Orders" value={data.order_count ?? orders.length} />
        <StatPill
          label="Total spent"
          value={`৳${Number(data.total_spent || 0).toLocaleString()}`}
          color="#34D399"
        />
      </div>
      <DetailCard title="Customer info">
        <FieldRow label="Customer ID" value={`#${data.id}`} icon={Hash} />
        <FieldRow label="Full name" value={data.name} icon={User} />
        <FieldRow label="Email" value={data.email} icon={Mail} />
        <FieldRow label="Phone" value={data.phone} icon={Phone} />
        <FieldRow
          label="Joined"
          value={data.created_at ? new Date(data.created_at).toLocaleDateString() : ""}
        />
      </DetailCard>

      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
        Order history
      </div>
      {orders.length === 0 ? (
        <div style={{ fontSize: 13, color: "#94A3B8" }}>
          No orders placed yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((o) => (
            <div
              key={o.id}
              style={{
                background: "#111A2B",
                border: "1px solid #1E293B",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, minWidth: 90 }}>
                {o.id}
              </div>
              <div style={{ color: "#94A3B8", fontSize: 12.5, minWidth: 70 }}>
                {o.order_date}
              </div>
              <div style={{ color: "#94A3B8", fontSize: 12.5, flex: 1, minWidth: 160 }}>
                {o.address || "No address provided"}
              </div>
              <span
                style={{
                  background: "rgba(37,99,235,0.14)",
                  color: "#60A5FA",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 999,
                }}
              >
                {o.status}
              </span>
              <div style={{ fontWeight: 700, fontSize: 13 }}>৳{o.total}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- order detail ---------- */
function OrderDetail({ data }) {
  const sc = (() => {
    const s = (data.status || "").toLowerCase();
    if (s === "delivered") return { bg: "rgba(34,197,94,0.14)", fg: "#4ADE80" };
    if (s === "cancelled") return { bg: "rgba(239,68,68,0.14)", fg: "#F87171" };
    return { bg: "rgba(37,99,235,0.14)", fg: "#60A5FA" };
  })();
  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatPill label="Total" value={`৳${data.total}`} color="#34D399" />
        <div
          style={{
            background: "#111A2B",
            border: "1px solid #1E293B",
            borderRadius: 14,
            padding: 16,
            flex: 1,
            minWidth: 120,
          }}
        >
          <span
            style={{
              background: sc.bg,
              color: sc.fg,
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 999,
            }}
          >
            {data.status}
          </span>
          <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 8 }}>
            Status
          </div>
        </div>
      </div>
      <DetailCard title="Order info">
        <FieldRow label="Order ID" value={data.id} icon={Hash} />
        <FieldRow label="Date" value={data.order_date} />
        <FieldRow label="Items" value={data.items} icon={Package} />
        <FieldRow label="Customer" value={data.customer_name} icon={User} />
        <FieldRow label="Address" value={data.address} icon={MapPin} />
        <FieldRow label="Rider ID" value={data.rider_id} icon={Bike} />
        <FieldRow label="Payout" value={data.payout ? `৳${data.payout}` : null} icon={Wallet} />
      </DetailCard>
    </>
  );
}

/* ---------- store detail ---------- */
function StoreDetail({ data }) {
  return (
    <DetailCard title="Store info">
      <FieldRow label="Store name" value={data.name} icon={Store} />
      <FieldRow label="License number" value={data.license_number} icon={Hash} />
      <FieldRow label="Address" value={data.address} icon={MapPin} />
      <FieldRow label="Phone" value={data.phone} icon={Phone} />
      <FieldRow label="Email" value={data.email} icon={Mail} />
      <FieldRow label="Status" value={data.status} />
      <FieldRow
        label="Joined"
        value={data.created_at ? new Date(data.created_at).toLocaleDateString() : ""}
      />
    </DetailCard>
  );
}
export default DetailPage;