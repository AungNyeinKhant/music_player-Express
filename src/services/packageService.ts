import { config } from "../config/app.config";
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

  public async subscribePackage(
    user_id: string,
    packageId: string,
    transition: Express.Multer.File
  ) {
    console.log(transition);
    const subscribePackage = await prisma.packages.findUnique({
      where: { id: packageId },
    });

    if (!subscribePackage) {
      throw new Error("Package not found");
    }

    const purchase = await prisma.purchase.create({
      data: {
        user_id: user_id,
        package_id: subscribePackage.id,
        num_of_days: subscribePackage.num_of_days,
        price: subscribePackage.price,
        transition: transition.filename,
      },
    });

    return purchase;
  }

  public async getPurchaseList() {
    const purchases = await prisma.purchase.findMany({
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        package_id: true,
        num_of_days: true,
        price: true,
        status: true,
        transition: true,
        created_at: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        package: {
          select: {
            name: true,
          },
        },
      },
    });
    return purchases.map((purchase) => ({
      ...purchase,
      transition: `${config.BACKEND_BASE_URL}/uploads/transitions/${purchase.transition}`,
    }));
  }

  public async confirmPurchase(purchase_id: string, reject?: boolean) {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchase_id },
      include: {
        user: true,
      },
    });

    if (
      !purchase ||
      purchase.status === "APPROVED" ||
      purchase.status === "REJECTED"
    ) {
      throw new Error("Something went wrong");
    }

    if (reject) {
      const rejectedPurchase = await prisma.purchase.update({
        where: { id: purchase_id },
        data: { status: "REJECTED" },
      });
      return { rejectedPurchase };
    }

    const currentDate = new Date();
    let newValidUntil: Date;

    if (purchase.user.valid_until < currentDate) {
      // If valid_until is in the past, start from current date
      newValidUntil = new Date(
        currentDate.getTime() + purchase.num_of_days * 24 * 60 * 60 * 1000
      );
    } else {
      // If valid_until is in the future, add days to existing valid_until
      newValidUntil = new Date(
        purchase.user.valid_until.getTime() +
          purchase.num_of_days * 24 * 60 * 60 * 1000
      );
    }

    // Update both purchase status and user's valid_until date in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const confirmedPurchase = await tx.purchase.update({
        where: { id: purchase_id },
        data: { status: "APPROVED" },
      });

      const updatedUser = await tx.user.update({
        where: { id: purchase.user_id },
        data: { valid_until: newValidUntil },
      });

      return { confirmedPurchase, updatedUser };
    });

    return result;
  }
}
const packageService = new PackageService();
export default packageService;
