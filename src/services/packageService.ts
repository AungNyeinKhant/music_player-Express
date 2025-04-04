import prisma from "../prisma";
import { PackageDto } from "../types/package.dto";

class PackageService {
  public async getPackages() {
    const packages = await prisma.packages.findMany();
    return packages;
  }

  public async createPackage(createPackageData: PackageDto) {
    const { name, description, num_of_days, price } = createPackageData;

    const newPackage = await prisma.packages.create({
      data: {
        name,
        description,
        num_of_days: num_of_days,
        price: price,
      },
    });

    return newPackage;
  }
}
const packageService = new PackageService();
export default packageService;
