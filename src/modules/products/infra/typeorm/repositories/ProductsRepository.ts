import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';
import AppError from '@shared/errors/AppError';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = await this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: {
        name
      }
    })

    return product

  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productIds = products.map(product => {
      product.id
    })

    const product = await this.ormRepository.find({
      where: {
        products
      }
    })

    if (productIds.length !== product.length) {
      throw new AppError('Missing product')
    }

    return product
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {

    const allProductsData = await this.findAllById(products)

    const updatedProducts = allProductsData.map(productData => {

      const productToBeUpdated = products.find(product => product.id === productData.id)

      if (!productToBeUpdated) {
        throw new AppError('Product not found')
      }

      if (productData.quantity < productToBeUpdated.quantity) {
        throw new AppError('Insuficient product quantity')
      }

      const newProduct = productData

      newProduct.quantity -= productToBeUpdated.quantity

      return newProduct

    })

    await this.ormRepository.save(updatedProducts)

    return updatedProducts
  }
}

export default ProductsRepository;
