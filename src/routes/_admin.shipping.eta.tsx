import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Zap, Clock, Package, IndianRupee, CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { shippingService, type ServiceabilityCourier, type ShippingType } from "@/services/shipping.service";

export const Route = createFileRoute("/_admin/shipping/eta")({ component: EtaPage });

const TIER_META: Record<ShippingType, { label: string; icon: React.ReactNode; color: string }> = {
  fastest: { label: "Same / Next Day", icon: <Zap className="w-4 h-4" />, color: "text-orange-500" },
  express: { label: "Express (2–4 days)", icon: <Clock className="w-4 h-4" />, color: "text-blue-500" },
  standard: { label: "Standard (5+ days)", icon: <Package className="w-4 h-4" />, color: "text-gray-500" },
};

const TIERS: ShippingType[] = ["fastest", "express", "standard"];

function CourierRow({ courier }: { courier: ServiceabilityCourier }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-sm">{courier.name}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <CalendarDays className="w-3 h-3" />
          {courier.estimatedDays != null ? `${courier.estimatedDays} day${courier.estimatedDays !== 1 ? "s" : ""}` : "—"}
          {courier.etd ? ` · ETA ${courier.etd}` : ""}
        </span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground text-xs">
          {courier.isCod ? (
            <Badge variant="outline" className="text-xs">COD</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Prepaid</Badge>
          )}
        </span>
        <div className="text-right">
          <div className="font-semibold flex items-center gap-0.5">
            <IndianRupee className="w-3 h-3" />
            {courier.totalCharge.toFixed(2)}
          </div>
          {courier.otherCharges > 0 && (
            <div className="text-xs text-muted-foreground">+₹{courier.otherCharges} other</div>
          )}
        </div>
      </div>
    </div>
  );
}

function EtaPage() {
  const [pincode, setPincode] = useState("");
  const [weight, setWeight] = useState("0.5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<ShippingType, ServiceabilityCourier[]> | null>(null);
  const [summary, setSummary] = useState<{ fastestDays: number | null; cheapestCharge: number | null } | null>(null);

  async function handleCheck() {
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError("Enter a valid 6-digit pincode");
      return;
    }
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      setError("Enter a valid weight");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await shippingService.checkServiceability(pincode.trim(), w);
      const grouped: Record<ShippingType, ServiceabilityCourier[]> = { fastest: [], express: [], standard: [] };
      for (const c of data.couriers) grouped[c.shippingType].push(c);
      setResult(grouped);
      setSummary({ fastestDays: data.fastestDays, cheapestCharge: data.cheapestCharge });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to check serviceability");
    } finally {
      setLoading(false);
    }
  }

  const totalCouriers = result ? TIERS.reduce((s, t) => s + result[t].length, 0) : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Delivery Time & Serviceability</h1>
        <p className="text-sm text-muted-foreground mt-1">Check available couriers and estimated delivery time for any pincode</p>
      </div>

      {/* Input form */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="pincode">Delivery Pincode</Label>
              <Input
                id="pincode"
                placeholder="e.g. 400001"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              />
            </div>
            <div className="w-32 space-y-1.5">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min={0.1}
                step={0.1}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              />
            </div>
            <Button onClick={handleCheck} disabled={loading} className="gap-2 shrink-0">
              <Search className="w-4 h-4" />
              {loading ? "Checking..." : "Check"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </CardContent>
      </Card>

      {/* Summary cards */}
      {summary && result && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-xs text-muted-foreground">Couriers Available</div>
              <div className="text-2xl font-bold mt-1 flex items-center gap-1">
                {totalCouriers > 0 ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-500" />{totalCouriers}</>
                ) : (
                  <><XCircle className="w-5 h-5 text-destructive" />0</>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-xs text-muted-foreground">Fastest Delivery</div>
              <div className="text-2xl font-bold mt-1">
                {summary.fastestDays != null ? `${summary.fastestDays}d` : "—"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-xs text-muted-foreground">Cheapest Charge</div>
              <div className="text-2xl font-bold mt-1 flex items-center gap-0.5">
                {summary.cheapestCharge != null ? (
                  <><IndianRupee className="w-4 h-4" />{summary.cheapestCharge.toFixed(0)}</>
                ) : "—"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Couriers grouped by tier */}
      {result && (
        totalCouriers === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
              No couriers available for pincode <strong>{pincode}</strong>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={TIERS.find((t) => result[t].length > 0) ?? "standard"}>
            <TabsList className="w-full">
              {TIERS.map((tier) => (
                <TabsTrigger key={tier} value={tier} className="flex-1 gap-1.5" disabled={result[tier].length === 0}>
                  <span className={TIER_META[tier].color}>{TIER_META[tier].icon}</span>
                  {TIER_META[tier].label}
                  {result[tier].length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">{result[tier].length}</Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {TIERS.map((tier) => (
              <TabsContent key={tier} value={tier}>
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className={`text-sm flex items-center gap-2 ${TIER_META[tier].color}`}>
                      {TIER_META[tier].icon}
                      {TIER_META[tier].label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result[tier].length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No couriers in this tier</p>
                    ) : (
                      result[tier].map((c) => <CourierRow key={c.name} courier={c} />)
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )
      )}
    </div>
  );
}
