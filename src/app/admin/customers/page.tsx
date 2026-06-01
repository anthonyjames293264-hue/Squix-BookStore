"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice, formatDate } from "@/lib/utils";
import { Search, Loader2, ArrowUpDown } from "lucide-react";
import type { Customer } from "@/lib/types";

type SortField = "full_name" | "total_orders" | "total_spent";
type SortDir = "asc" | "desc";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("full_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    async function fetchCustomers() {
      const supabase = createClient();
      const { data } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      setCustomers(data ?? []);
      setLoading(false);
    }

    fetchCustomers();
  }, []);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const filteredCustomers = customers
    .filter(
      (c) =>
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "full_name") {
        cmp = a.full_name.localeCompare(b.full_name);
      } else if (sortField === "total_orders") {
        cmp = a.total_orders - b.total_orders;
      } else if (sortField === "total_spent") {
        cmp = a.total_spent - b.total_spent;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-fg-3" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-fg">
          Customers
        </h2>
        <p className="text-fg-3 mt-1">
          Your customer base ({customers.length} total)
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <p className="text-fg-3 text-sm text-center py-8">
              No customers found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-edge">
                    <th className="text-left py-3 px-2">
                      <button
                        onClick={() => toggleSort("full_name")}
                        className="flex items-center gap-1 font-medium text-fg-3 hover:text-fg"
                      >
                        Name
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Email
                    </th>
                    <th className="text-left py-3 px-2 hidden md:table-cell">
                      <button
                        onClick={() => toggleSort("total_orders")}
                        className="flex items-center gap-1 font-medium text-fg-3 hover:text-fg"
                      >
                        Orders
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-2 hidden md:table-cell">
                      <button
                        onClick={() => toggleSort("total_spent")}
                        className="flex items-center gap-1 font-medium text-fg-3 hover:text-fg"
                      >
                        Total Spent
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3 hidden lg:table-cell">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-edge hover:bg-hover-fill"
                    >
                      <td className="py-3 px-2 font-medium text-fg">
                        {customer.full_name}
                      </td>
                      <td className="py-3 px-2 text-fg-2">
                        {customer.email}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell text-fg-2">
                        {customer.total_orders}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell font-medium">
                        {formatPrice(customer.total_spent)}
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell text-fg-3">
                        {formatDate(customer.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
