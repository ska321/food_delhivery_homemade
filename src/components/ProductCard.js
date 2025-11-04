import Image from "next/image";
import { formatCurrency } from "@/utils/format";

export default function ProductCard({ item, onAdd }) {
  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer hover:-translate-y-1"
    >
      {/* Image Section */}
      <div className="relative w-full h-48">
        <Image
          src={item.image || "/placeholder.png"}
          alt={item.name}
          fill
          className="object-cover rounded-t-2xl"
        />
        {/* Optional tag or overlay */}
        {item.isPopular && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Popular
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {item.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {item.description || "Delicious food prepared with love."}
          </p>

          {item.size && (
            <p className="text-xs text-gray-400 mt-1">Size: {item.size}</p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <strong className="text-lg text-gray-900">
            {formatCurrency(item.price)}
          </strong>
          <button
            onClick={() => onAdd(item)}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-full transition-all"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
