import { Exclude } from 'class-transformer';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { genSalt, hash } from 'bcryptjs';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  profile_image?: string;

  @Column({ nullable: true })
  theme_color?: string;

  @Column({ type: 'text', nullable: true })
  refresh_token?: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  // Orders placed by this user (as a buyer)
  @OneToMany(() => Order, (order) => order.buyer)
  placed_orders: Order[];

  // Orders to be fulfilled by this user (as a seller)
  @OneToMany(() => Order, (order) => order.seller)
  received_orders: Order[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await genSalt();
      this.password = await hash(this.password, salt);
    }
  }
}
