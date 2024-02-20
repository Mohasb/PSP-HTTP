const errorHandler = require("../../validations/errorHandlers");
const userSchema = require("../../models/userSchema");
const roomSchema = require("../../models/roomSchema");
const moment = require("moment");
const reservationSchema = require("../../models/reservationSchema");

const validateReservation = async (reservationDetails, prices, res) => {
    // Validar usuario
    const emailReserva = reservationDetails.user.email;
    const user = await userSchema.findOne({ email: emailReserva });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No hay ningun usuario con el email:  ${emailReserva}`,
      });
    }

    // Obtener números de habitación disponibles para el tipo de habitación
    const availableRooms = await roomSchema
      .find({
        type: reservationDetails.roomType,
        isAvailable: true,
      })
      .select("room_number");

    const validateDate = (dateString) => {
      const parsedDate = moment(dateString, moment.ISO_8601, true);
      if (!parsedDate.isValid()) {
        return null;
      }
      return parsedDate.startOf("day");
    };

    // Comprobar que la fecha de check-in sea al menos la de hoy
    const today = moment().startOf("day").hour(14);
    const checkInDate = validateDate(
      reservationDetails.check_in_date,
      "check-in"
    ).hour(14);
    if (checkInDate.isBefore(today)) {
      throw new Error("La fecha de check-in debe ser como mínimo la de hoy");
    }

    // Comprobar que la fecha de check-out sea al menos un día después de hoy
    const minCheckOutDate = today.clone().add(1, "day");
    const checkOutDate = validateDate(
      reservationDetails.check_out_date,
      "check-out"
    ).hour(16);
    if (checkOutDate.isBefore(minCheckOutDate)) {
      throw new Error(
        "La fecha de check-out debe ser al menos un día después de hoy"
      );
    }

    // Comprobar que la fecha de check-out no sea menor a la fecha de check-in
    if (checkOutDate.isBefore(checkInDate)) {
      throw new Error(
        "La fecha de check-out no puede ser menor a la fecha de check-in"
      );
    }

    const daysDifference = checkOutDate.diff(checkInDate, "days");
    const ocupation = reservationDetails.ocupation;

    // Calcular el roomTypePrice
    const roomTypePrice = prices._doc[reservationDetails.roomType];

    // Calcular el totalPrice
    const totalPrice = roomTypePrice * daysDifference * ocupation;

    // Calcular el precio de los extras
    const extrasTotalPrice = reservationDetails.extras.reduce(
      (total, extra) =>
        extra.value ? total + prices._doc[extra.name] * daysDifference : total,
      0
    );

    // Actualizar las propiedades de la reserva
    reservationDetails.total_price = totalPrice + extrasTotalPrice;

    // Verificar solapamiento de fechas con reservas existentes
    const overlappingReservation = await reservationSchema.find({
      room_number: { $in: availableRooms.map((room) => room.room_number) },
      $or: [
        {
          check_in_date: { $lt: checkOutDate },
          check_out_date: { $gt: checkInDate },
        },
        {
          check_in_date: { $gte: checkInDate, $lt: checkOutDate },
        },
        {
          check_out_date: { $gt: checkInDate, $lte: checkOutDate },
        },
      ],
      _id: { $ne: reservationDetails._id }, // Excluir la reserva actual en caso de edición
    });

    // Si hay solapamiento, encontrar la siguiente habitación disponible
    if (overlappingReservation.length > 0) {
      const reservedRooms = overlappingReservation.map(
        (reservedRoom) => reservedRoom.room_number
      );

      const nextAvailableRoom = availableRooms.find(
        (room) => !reservedRooms.includes(room.room_number)
      );

      if (nextAvailableRoom) {
        reservationDetails.room_number = nextAvailableRoom.room_number;
      } else {
        const error = {
          success: false,
          message:
            "No hay disponibilidad para el tipo de habitación en las fechas deseadas",
        };

        throw error;
      }
      
    } else {
      // Asignar la habitación disponible con menor número a la reserva
      const availableRoom = availableRooms.reduce((minRoom, room) =>
        minRoom.room_number < room.room_number ? minRoom : room
      );
      reservationDetails.room_number = availableRoom.room_number;
    }

    return reservationDetails;

};

module.exports = validateReservation;
