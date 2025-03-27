import prisma from "../prisma";
import { PackageDto } from "../types/package.dto";

class PackageService {
  public async createPackage(createPackageData: PackageDto) {
    const { name, description, num_of_days, price } = createPackageData;

    const newPackage = await prisma.packages.create({
      data: {
        name,
        description,
        num_of_days: parseInt(num_of_days),
        price: parseInt(price),
      },
    });

    return newPackage;
  }
}
const packageService = new PackageService();
export default packageService;
