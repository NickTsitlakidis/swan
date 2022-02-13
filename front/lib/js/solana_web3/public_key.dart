import 'package:js/js.dart';

@JS('wallet.solanaWeb3.PublicKey')
class PublicKey {
  external PublicKey(String value);
  external String toBase58();
  @override
  external String toString();
}
