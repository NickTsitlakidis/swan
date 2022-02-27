class UserLogin {
  String? selectedWallet;
  String? address;
  String? statusCode;
  String? message;
  String? error;
  String? tokenValue;
  DateTime? expiresAt;

  UserLogin(
      {required this.selectedWallet,
      required this.address,
      required this.statusCode,
      this.message,
      this.error,
      this.tokenValue,
      this.expiresAt});

  UserLogin.fromJson(Map<dynamic, dynamic> json) {
    selectedWallet = json['selectedWallet'];
    address = json['address'];
    statusCode = json['statusCode'];
    message = json['message'];
    error = json['error'];
    tokenValue = json['tokenValue'];
    expiresAt =
        json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null;
  }
}
