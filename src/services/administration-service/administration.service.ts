import { get } from "@/src/@core/utils/get";
import { authService } from "./auth/auth.service";
import { employeeService } from "./employee/employee.service";
import { newsAndOffersService } from "./news-and-offers/news-and-offers.service";
import { cinemaService } from "./cinema/cinema.service";
import { screenService } from "./screen/screen.service";
import { seatTypeService } from "./seat-type/seat-type.service";
import { cinemaAmenityService } from "./cinema-amenity/cinema-amenity.service";
import { amenityTypeService } from "./amenity-type/amenity-type.service";

export const rootPath: string = get.rootPath("/administration-service/api");

export const administrationService = {
    authService: authService,
    employeeService: employeeService,
    newsAndOffersService: newsAndOffersService,
    cinemaService: cinemaService,
    screenService: screenService,
    seatTypeService: seatTypeService,
    cinemaAmenityService: cinemaAmenityService,
    amenityTypeService: amenityTypeService,
};