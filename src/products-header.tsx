import { useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
import "./index.css";
import "./products-page.css";

function ProductsHeader() {
  const [walletAddress] = useState<string | null>(null);
  const navigate = (tab: string) => {
    window.location.href = tab === "overview" ? "/" : `/${tab}`;
  };
  return (
    <AuthProvider>
      <Header
        activeTab="products"
        setActiveTab={navigate}
        walletAddress={walletAddress}
        onConnectWallet={() => undefined}
      />
    </AuthProvider>
  );
}

const root = document.getElementById("site-header");
if (root) createRoot(root).render(<ProductsHeader />);
