import HeroImage from "../components/home/HeroImage";
import ProductList from "../components/home/ProductList";

export default function Home() {
  return (
    <div className="bg-emerald-50/30 pb-10">
      <HeroImage />
      <ProductList />
    </div>
  );
}
