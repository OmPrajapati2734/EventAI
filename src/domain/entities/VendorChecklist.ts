export type VendorStatus = 'pending' | 'contacted' | 'booked' | 'rejected' | 'completed';

export interface IVendorChecklistProps {
  id: string;
  role: string; // e.g., "Catering", "Photography", "DJ / Audio", "Florist", "Venue"
  vendorName: string;
  contact: string; // phone or email
  status: VendorStatus;
  price: number;
}

/**
 * VendorChecklist Entity representing vendor procurement and tracking.
 */
export class VendorChecklist {
  public readonly id: string;
  public readonly role: string;
  public readonly vendorName: string;
  public readonly contact: string;
  public readonly status: VendorStatus;
  public readonly price: number;

  constructor(props: IVendorChecklistProps) {
    this.validate(props);
    this.id = props.id;
    this.role = props.role.trim();
    this.vendorName = props.vendorName.trim();
    this.contact = props.contact.trim();
    this.status = props.status;
    this.price = props.price;
  }

  private validate(props: IVendorChecklistProps): void {
    if (!props.id || typeof props.id !== 'string') {
      throw new Error('VendorChecklist ID must be a non-empty string.');
    }
    if (!props.role || props.role.trim().length === 0) {
      throw new Error('Vendor role cannot be empty.');
    }
    if (!props.vendorName || props.vendorName.trim().length === 0) {
      throw new Error('Vendor name cannot be empty.');
    }
    if (!props.contact || props.contact.trim().length === 0) {
      throw new Error('Vendor contact cannot be empty.');
    }
    const validStatuses: VendorStatus[] = ['pending', 'contacted', 'booked', 'rejected', 'completed'];
    if (!validStatuses.includes(props.status)) {
      throw new Error(`Invalid vendor status "${props.status}". Allowed: ${validStatuses.join(', ')}`);
    }
    if (typeof props.price !== 'number' || props.price < 0) {
      throw new Error('Vendor price must be a non-negative number.');
    }
  }

  public updateStatus(newStatus: VendorStatus): VendorChecklist {
    return new VendorChecklist({
      ...this.toJSON(),
      status: newStatus,
    });
  }

  public toJSON(): IVendorChecklistProps {
    return {
      id: this.id,
      role: this.role,
      vendorName: this.vendorName,
      contact: this.contact,
      status: this.status,
      price: this.price,
    };
  }
}
