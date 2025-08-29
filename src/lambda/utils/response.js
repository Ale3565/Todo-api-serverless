"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const createResponse = (statusCode, body, headers = {}) => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
            ...headers,
        },
        body: JSON.stringify(body),
    };
};
const successResponse = (data, message = 'Success', statusCode = 200) => {
    return createResponse(statusCode, {
        success: true,
        data,
        message,
    });
};
exports.successResponse = successResponse;
const errorResponse = (statusCode, error, message = 'An error occurred') => {
    return createResponse(statusCode, {
        success: false,
        error,
        message,
    });
};
exports.errorResponse = errorResponse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZXNwb25zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxNQUFNLGNBQWMsR0FBRyxDQUNyQixVQUFrQixFQUNsQixJQUFpQixFQUNqQixVQUFrQyxFQUFFLEVBQ2IsRUFBRTtJQUN6QixPQUFPO1FBQ0wsVUFBVTtRQUNWLE9BQU8sRUFBRTtZQUNQLGNBQWMsRUFBRSxrQkFBa0I7WUFDbEMsNkJBQTZCLEVBQUUsR0FBRztZQUNsQyw4QkFBOEIsRUFBRSxpREFBaUQ7WUFDakYsOEJBQThCLEVBQUUsNkJBQTZCO1lBQzdELEdBQUcsT0FBTztTQUNYO1FBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0tBQzNCLENBQUM7QUFDSixDQUFDLENBQUM7QUFFSyxNQUFNLGVBQWUsR0FBRyxDQUM3QixJQUFPLEVBQ1AsVUFBa0IsU0FBUyxFQUMzQixhQUFxQixHQUFHLEVBQ0QsRUFBRTtJQUN6QixPQUFPLGNBQWMsQ0FBQyxVQUFVLEVBQUU7UUFDaEMsT0FBTyxFQUFFLElBQUk7UUFDYixJQUFJO1FBQ0osT0FBTztLQUNSLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQVZXLFFBQUEsZUFBZSxtQkFVMUI7QUFFSyxNQUFNLGFBQWEsR0FBRyxDQUMzQixVQUFrQixFQUNsQixLQUFhLEVBQ2IsVUFBa0IsbUJBQW1CLEVBQ2QsRUFBRTtJQUN6QixPQUFPLGNBQWMsQ0FBQyxVQUFVLEVBQUU7UUFDaEMsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLO1FBQ0wsT0FBTztLQUNSLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQVZXLFFBQUEsYUFBYSxpQkFVeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlSZXN1bHQgfSBmcm9tICdhd3MtbGFtYmRhJztcclxuaW1wb3J0IHsgQXBpUmVzcG9uc2UgfSBmcm9tICcuLi90eXBlcy90b2RvJztcclxuXHJcbmNvbnN0IGNyZWF0ZVJlc3BvbnNlID0gKFxyXG4gIHN0YXR1c0NvZGU6IG51bWJlcixcclxuICBib2R5OiBBcGlSZXNwb25zZSxcclxuICBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge31cclxuKTogQVBJR2F0ZXdheVByb3h5UmVzdWx0ID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgc3RhdHVzQ29kZSxcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcclxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLFgtQW16LURhdGUsQXV0aG9yaXphdGlvbixYLUFwaS1LZXknLFxyXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdPUFRJT05TLFBPU1QsR0VULFBVVCxERUxFVEUnLFxyXG4gICAgICAuLi5oZWFkZXJzLFxyXG4gICAgfSxcclxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc3VjY2Vzc1Jlc3BvbnNlID0gPFQ+KFxyXG4gIGRhdGE6IFQsXHJcbiAgbWVzc2FnZTogc3RyaW5nID0gJ1N1Y2Nlc3MnLFxyXG4gIHN0YXR1c0NvZGU6IG51bWJlciA9IDIwMFxyXG4pOiBBUElHYXRld2F5UHJveHlSZXN1bHQgPT4ge1xyXG4gIHJldHVybiBjcmVhdGVSZXNwb25zZShzdGF0dXNDb2RlLCB7XHJcbiAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgZGF0YSxcclxuICAgIG1lc3NhZ2UsXHJcbiAgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZXJyb3JSZXNwb25zZSA9IChcclxuICBzdGF0dXNDb2RlOiBudW1iZXIsXHJcbiAgZXJyb3I6IHN0cmluZyxcclxuICBtZXNzYWdlOiBzdHJpbmcgPSAnQW4gZXJyb3Igb2NjdXJyZWQnXHJcbik6IEFQSUdhdGV3YXlQcm94eVJlc3VsdCA9PiB7XHJcbiAgcmV0dXJuIGNyZWF0ZVJlc3BvbnNlKHN0YXR1c0NvZGUsIHtcclxuICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgZXJyb3IsXHJcbiAgICBtZXNzYWdlLFxyXG4gIH0pO1xyXG59OyJdfQ==