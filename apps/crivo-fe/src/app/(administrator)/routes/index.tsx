import { FaChessBoard } from "react-icons/fa6";
import { GoGear } from "react-icons/go";
import { IoBusinessOutline } from "react-icons/io5";
import { LuFolderTree, LuTicketsPlane, LuUsers } from "react-icons/lu";
import { MdOutlineAccountBalance } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { TbTransactionDollar } from "react-icons/tb";
import { TiContacts } from "react-icons/ti";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/secure/dashboard",
    label: "Dashboard",
    icon: <RxDashboard className="size-5" />,
  },
  {
    href: "/secure/onboarding",
    label: "Onboarding",
    icon: <FaChessBoard className="size-5" />,
  },
  {
    href: "/secure/documents",
    label: "Documentos",
    icon: <LuFolderTree className="size-5" />,
  },
  {
    href: "/secure/transactions",
    label: "Transações",
    icon: <TbTransactionDollar className="size-5" />,
  },
  {
    href: "/secure/my-company",
    label: "Empresas",
    icon: <IoBusinessOutline className="size-5" />,
  },
  {
    href: "/secure/accounts",
    label: "Contas",
    icon: <MdOutlineAccountBalance className="size-5" />,
  },
  {
    href: "/secure/contacts",
    label: "Contatos",
    icon: <TiContacts className="size-5" />,
  },
  {
    href: "/secure/plans",
    label: "Planos",
    icon: <LuTicketsPlane className="size-5" />,
  },
  {
    href: "/secure/users",
    label: "Usuários",
    icon: <LuUsers className="size-5" />,
  },
  {
    href: "/secure/configuracoes",
    label: "Configurações",
    icon: <GoGear className="size-5" />,
  },
];
