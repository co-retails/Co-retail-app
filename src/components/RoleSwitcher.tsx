import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';
import { UserIcon, TruckIcon } from 'lucide-react';

export type UserRole = 'store-staff' | 'partner';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  className?: string;
}

export default function RoleSwitcher({ currentRole, onRoleChange, className = '' }: RoleSwitcherProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h6 className="title-small text-on-surface">Switch role</h6>
          <p className="body-small text-on-surface-variant">
            Access different features based on your role
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="role-select" className="label-small text-on-surface-variant">
            Access role
          </label>
          <Select value={currentRole} onValueChange={(value) => onRoleChange(value as UserRole)}>
            <SelectTrigger
              id="role-select"
              className="w-full bg-surface border border-outline rounded-lg min-h-[48px] text-left"
              aria-label="Select access role"
            >
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="store-staff">Store staff</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant={currentRole === 'store-staff' ? 'default' : 'outline'}
            onClick={() => onRoleChange('store-staff')}
            className="justify-start h-auto p-4 flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2 w-full">
              <UserIcon size={20} className="flex-shrink-0" />
              <span className="label-large break-words">Store Staff</span>
              {currentRole === 'store-staff' && (
                <Badge variant="secondary" className="ml-auto flex-shrink-0">Active</Badge>
              )}
            </div>
            <p className="body-small text-left opacity-80 break-words whitespace-normal overflow-wrap-anywhere">
              Receive deliveries, manage items, and handle stock
            </p>
          </Button>
          
          <Button
            variant={currentRole === 'partner' ? 'default' : 'outline'}
            onClick={() => onRoleChange('partner')}
            className="justify-start h-auto p-4 flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2 w-full">
              <TruckIcon size={20} className="flex-shrink-0" />
              <span className="label-large break-words">Partner</span>
              {currentRole === 'partner' && (
                <Badge variant="secondary" className="ml-auto flex-shrink-0">Active</Badge>
              )}
            </div>
            <p className="body-small text-left opacity-80 break-words whitespace-normal overflow-wrap-anywhere">
              Create orders, manage boxes, and handle deliveries
            </p>
          </Button>
        </div>
      </div>
    </Card>
  );
}