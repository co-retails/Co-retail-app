import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowLeftIcon, 
  PackageIcon, 
  ScanIcon, 
  CheckIcon,
  AlertTriangleIcon
} from 'lucide-react';

export interface ReturnDelivery {
  id: string;
  returnOrderNumber: string;
  partnerName: string;
  itemCount: number;
  boxCount: number;
  status: 'pending' | 'received';
  createdDate: string;
}

interface ReturnReceivingScreenProps {
  onBack: () => void;
  onReceiveReturn: (returnOrderNumber: string) => void;
}

export default function ReturnReceivingScreen({
  onBack,
  onReceiveReturn
}: ReturnReceivingScreenProps) {
  const [returnOrderNumber, setReturnOrderNumber] = useState('');
  const [returnDelivery, setReturnDelivery] = useState<ReturnDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock return deliveries data
  const mockReturnDeliveries: ReturnDelivery[] = [
    {
      id: 'RET-001',
      returnOrderNumber: '890fhor8r4wrjf',
      partnerName: 'Fashion Hub',
      itemCount: 25,
      boxCount: 3,
      status: 'pending',
      createdDate: '2024-12-09'
    },
    {
      id: 'RET-002', 
      returnOrderNumber: '123456789653',
      partnerName: 'Sellpy',
      itemCount: 18,
      boxCount: 2,
      status: 'pending',
      createdDate: '2024-12-08'
    }
  ];

  const handleSearchReturnOrder = () => {
    if (!returnOrderNumber.trim()) {
      setError('Please enter a return order number');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const foundDelivery = mockReturnDeliveries.find(
        delivery => delivery.returnOrderNumber === returnOrderNumber.trim()
      );

      if (foundDelivery) {
        setReturnDelivery(foundDelivery);
        setError('');
      } else {
        setError('Return order not found. Please check the number and try again.');
        setReturnDelivery(null);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRegisterReturn = () => {
    if (returnDelivery) {
      onReceiveReturn(returnDelivery.returnOrderNumber);
      // In real app, this would update the delivery status
      setReturnDelivery({ ...returnDelivery, status: 'received' });
    }
  };

  const handleScanQR = () => {
    // Mock QR scan - simulate scanning a delivery ID
    const mockScannedId = '890fhor8r4wrjf';
    setReturnOrderNumber(mockScannedId);
    handleSearchReturnOrder();
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-container border-b border-outline-variant">
        <div className="px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-on-surface-variant"
            >
              <ArrowLeftIcon size={20} />
            </Button>
            <div>
              <h1 className="headline-small text-on-surface">Receive Returns</h1>
              <p className="body-medium text-on-surface-variant">Store Staff Return Processing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        {/* Search Return Order */}
        <Card>
          <CardHeader>
            <CardTitle className="title-medium">Find Return Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="returnOrder">Return Order Number</Label>
              <p className="body-small text-on-surface-variant">
                Enter the last part of the Delivery ID (after the dash)
              </p>
              <div className="flex gap-2">
                <Input
                  id="returnOrder"
                  value={returnOrderNumber}
                  onChange={(e) => setReturnOrderNumber(e.target.value)}
                  placeholder="e.g., 890fhor8r4wrjf"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearchReturnOrder}
                  disabled={isLoading}
                  variant="outline"
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleScanQR}
                variant="outline"
                className="flex-col h-auto py-4 px-6"
              >
                <ScanIcon size={24} className="mb-2" />
                <span className="label-medium">Scan QR Code</span>
              </Button>
            </div>

            {error && (
              <Alert>
                <AlertTriangleIcon size={16} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Return Delivery Details */}
        {returnDelivery && (
          <Card>
            <CardHeader>
              <CardTitle className="title-medium flex items-center justify-between">
                Return Delivery Details
                <Badge variant={returnDelivery.status === 'received' ? 'default' : 'secondary'}>
                  {returnDelivery.status === 'received' ? 'Received' : 'Pending'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="body-small text-on-surface-variant">Return Order Number</p>
                  <p className="title-small text-on-surface">{returnDelivery.returnOrderNumber}</p>
                </div>
                <div>
                  <p className="body-small text-on-surface-variant">Partner</p>
                  <p className="title-small text-on-surface">{returnDelivery.partnerName}</p>
                </div>
                <div>
                  <p className="body-small text-on-surface-variant">Items</p>
                  <p className="title-small text-on-surface">{returnDelivery.itemCount}</p>
                </div>
                <div>
                  <p className="body-small text-on-surface-variant">Boxes</p>
                  <p className="title-small text-on-surface">{returnDelivery.boxCount}</p>
                </div>
                <div>
                  <p className="body-small text-on-surface-variant">Created Date</p>
                  <p className="title-small text-on-surface">{returnDelivery.createdDate}</p>
                </div>
                <div>
                  <p className="body-small text-on-surface-variant">Full Delivery ID</p>
                  <p className="title-small text-on-surface">122345678-{returnDelivery.returnOrderNumber}</p>
                </div>
              </div>

              {returnDelivery.status === 'pending' && (
                <Alert>
                  <AlertDescription>
                    Verify the return details above and click "Register Return" to confirm receipt.
                  </AlertDescription>
                </Alert>
              )}

              {returnDelivery.status === 'received' && (
                <Alert>
                  <CheckIcon size={16} />
                  <AlertDescription>
                    Return has been successfully registered and received.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {returnDelivery.status === 'pending' ? (
                  <Button onClick={handleRegisterReturn} className="flex-1">
                    <CheckIcon size={16} className="mr-2" />
                    Register Return
                  </Button>
                ) : (
                  <Button disabled className="flex-1">
                    <CheckIcon size={16} className="mr-2" />
                    Already Registered
                  </Button>
                )}
                <Button variant="outline" onClick={() => setReturnDelivery(null)}>
                  Search Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Returns */}
        <Card>
          <CardHeader>
            <CardTitle className="title-medium">Recent Return Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockReturnDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                  onClick={() => {
                    setReturnOrderNumber(delivery.returnOrderNumber);
                    setReturnDelivery(delivery);
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="title-small text-on-surface">{delivery.returnOrderNumber}</p>
                      <Badge variant={delivery.status === 'received' ? 'default' : 'secondary'}>
                        {delivery.status === 'received' ? 'Received' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="body-small text-on-surface-variant">
                      {delivery.partnerName} • {delivery.itemCount} items • {delivery.createdDate}
                    </p>
                  </div>
                  <PackageIcon size={20} className="text-on-surface-variant" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}